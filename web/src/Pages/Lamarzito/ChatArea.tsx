import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import {
    PaperPlaneTilt, CaretDown, CaretUp, Wrench,
    Robot, Binary, Cpu, ArrowsLeftRight, Function, Queue,
} from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { getCookie } from '../../utils/cookies'
import { streamMessage, retryMessage, SSEEvent, ModelOption } from '../../services/chat'
import styles from './styles.module.scss'

export interface ChatMessage {
    id?: number
    role: 'user' | 'assistant'
    content: string
    llm_model?: string | null
    toolCalls?: ToolCall[]
    streaming?: boolean
    isError?: boolean
    errorCode?: string
}

interface ToolCall {
    name: string
    input: Record<string, unknown>
    output: string
}

interface FallbackNotice {
    message: string
}

interface Props {
    conversationId: string | null
    initialMessages: ChatMessage[]
    models: ModelOption[]
    onTitleChange?: (title: string) => void
    onRequestCreate?: (message: string) => void
    initialInput?: string
    autoSend?: boolean
}

const SUGGESTIONS = [
    {
        Icon: Binary,
        label: 'Conversão de bases',
        description: 'Binário, hex, decimal, complemento de dois',
        message: 'Explique as conversões entre bases numéricas (binário, octal, decimal, hexadecimal) com exemplos práticos.',
    },
    {
        Icon: Cpu,
        label: 'Assembly RISC-V',
        description: 'Instruções, formatos R/I/S/B/U/J, codificação',
        message: 'Explique os formatos de instrução RISC-V (R, I, S, B, U, J) e como cada campo é codificado, com exemplos.',
    },
    {
        Icon: Function,
        label: 'IEEE 754',
        description: 'Representação de ponto flutuante em 32 bits',
        message: 'Como funciona a representação de números em ponto flutuante no padrão IEEE 754 de 32 bits? Mostre um exemplo.',
    },
    {
        Icon: Queue,
        label: 'Pipeline',
        description: 'Estágios, hazards, forwarding e stalls',
        message: 'Explique os estágios do pipeline (IF, ID, EX, MEM, WB), os tipos de hazards e como forwarding e stalls resolvem hazards de dados.',
    },
    {
        Icon: ArrowsLeftRight,
        label: 'Cache e Memória',
        description: 'Mapeamento direto, associativo, política LRU',
        message: 'Explique os tipos de mapeamento de cache (direto, associativo por conjunto, totalmente associativo) e as políticas de substituição LRU e FIFO.',
    },
]

const SSE_ERROR_MESSAGES: Record<string, string> = {
    'gemini.exceeded_quota': 'Sua cota da API do Gemini foi excedida. Aguarde alguns minutos e tente novamente.',
    'gemini.invalid_api_key': 'Chave de API inválida ou sem permissão para o modelo selecionado. Verifique suas configurações.',
    'gemini.model_unavailable': 'Modelo temporariamente indisponível.',
    'gemini.all_models_exhausted': 'Todos os modelos ativos estão sem cota ou indisponíveis. Tente novamente em alguns minutos.',
    'gemini.no_models_enabled': 'Nenhum modelo está ativo. Ative ao menos um nas configurações.',
}

function formatSseError(data: Record<string, unknown>): string {
    const code = data.error_code as string | undefined
    if (code && SSE_ERROR_MESSAGES[code]) return SSE_ERROR_MESSAGES[code]
    return data.message as string
}

function ToolCallCard({ call }: { call: ToolCall }) {
    const [open, setOpen] = useState(false)
    return (
        <div className={styles.toolCard}>
            <button className={styles.toolCardHeader} onClick={() => setOpen(v => !v)}>
                <Wrench size={13} />
                <span>{call.name}</span>
                {open ? <CaretUp size={13} /> : <CaretDown size={13} />}
            </button>
            {open && (
                <div className={styles.toolCardBody}>
                    <p className={styles.toolLabel}>Entrada</p>
                    <pre className={styles.toolPre}>{JSON.stringify(call.input, null, 2)}</pre>
                    <p className={styles.toolLabel}>Saída</p>
                    <pre className={styles.toolPre}>{call.output}</pre>
                </div>
            )}
        </div>
    )
}

export default function ChatArea({
    conversationId,
    initialMessages,
    models,
    onTitleChange,
    onRequestCreate,
    initialInput,
    autoSend,
}: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
    const [input, setInput] = useState(initialInput ?? '')
    const [sending, setSending] = useState(false)
    const [fallbackNotice, setFallbackNotice] = useState<FallbackNotice | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const sendRef = useRef<() => Promise<void>>(async () => {})

    useEffect(() => {
        setMessages(initialMessages)
    }, [conversationId, initialMessages])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        function handleGlobalKeyDown(e: globalThis.KeyboardEvent) {
            const tag = (e.target as HTMLElement).tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
            if ((e.target as HTMLElement).isContentEditable) return
            if (e.ctrlKey || e.metaKey || e.altKey) return
            if (e.key.length !== 1) return
            textareaRef.current?.focus()
        }
        document.addEventListener('keydown', handleGlobalKeyDown)
        return () => document.removeEventListener('keydown', handleGlobalKeyDown)
    }, [])

    // auto-send when mounting a freshly created conversation with a pending message
    useEffect(() => {
        if (autoSend && initialInput && conversationId) {
            sendRef.current()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function modelAlias(slug: string | null | undefined): string | null {
        if (!slug) return null
        return models.find(m => m.slug === slug)?.name ?? slug
    }

    function showFallbackNotice(previousError: string | undefined, nextModel: string) {
        const reason = previousError ? (SSE_ERROR_MESSAGES[previousError] ?? previousError) : 'indisponível'
        setFallbackNotice({ message: `${reason} Tentando ${nextModel}…` })
        window.setTimeout(() => setFallbackNotice(null), 6000)
    }

    function fillSuggestion(message: string) {
        setInput(message)
        textareaRef.current?.focus()
        // update height for pre-filled text
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
            }
        })
    }

    async function send() {
        const content = input.trim()
        if (!content || sending) return

        if (!conversationId) {
            onRequestCreate?.(content)
            return
        }

        const apiKey = getCookie('gemini_api_key')

        if (!apiKey) {
            window.dispatchEvent(new CustomEvent('app:error', { detail: 'Configure sua Google API Key antes de enviar mensagens.' }))
            return
        }

        setInput('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        setFallbackNotice(null)
        setMessages(prev => [...prev, { role: 'user', content }])
        setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, toolCalls: [] }])
        setSending(true)

        const currentToolCalls: ToolCall[] = []

        const onEvent = (event: SSEEvent) => {
            if (event.type === 'title') {
                onTitleChange?.(event.data.title as string)
            } else if (event.type === 'model') {
                const { name, slug, attempt, previous_error } = event.data as {
                    name: string; slug: string; attempt: number; previous_error?: string
                }
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') next[next.length - 1] = { ...last, llm_model: slug }
                    return next
                })
                if (attempt > 1) showFallbackNotice(previous_error, name)
            } else if (event.type === 'token') {
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') {
                        next[next.length - 1] = { ...last, content: last.content + (event.data.content as string) }
                    }
                    return next
                })
            } else if (event.type === 'tool_call') {
                const call: ToolCall = {
                    name: event.data.name as string,
                    input: event.data.input as Record<string, unknown>,
                    output: event.data.output as string,
                }
                currentToolCalls.push(call)
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') {
                        next[next.length - 1] = { ...last, toolCalls: [...currentToolCalls] }
                    }
                    return next
                })
            } else if (event.type === 'done') {
                setFallbackNotice(null)
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') {
                        next[next.length - 1] = { ...last, streaming: false }
                    }
                    return next
                })
                setSending(false)
            } else if (event.type === 'error') {
                setFallbackNotice(null)
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') {
                        next[next.length - 1] = {
                            ...last,
                            content: formatSseError(event.data),
                            streaming: false,
                            isError: true,
                            errorCode: event.data.error_code as string | undefined,
                        }
                    }
                    return next
                })
                setSending(false)
            }
        }

        try {
            const gen = streamMessage(conversationId, content, onEvent)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _ of gen) { /* events processed in onEvent */ }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao enviar mensagem'
            setMessages(prev => {
                const next = [...prev]
                const last = next[next.length - 1]
                if (last?.role === 'assistant') {
                    next[next.length - 1] = { ...last, content: `Erro: ${msg}`, streaming: false }
                }
                return next
            })
        } finally {
            setSending(false)
            setMessages(prev => {
                const next = [...prev]
                const last = next[next.length - 1]
                if (last?.role === 'assistant' && last.streaming) {
                    next[next.length - 1] = { ...last, streaming: false }
                }
                return next
            })
        }
    }

    sendRef.current = send

    async function handleRetry() {
        if (!conversationId || sending) return

        const apiKey = getCookie('gemini_api_key')
        if (!apiKey) {
            window.dispatchEvent(new CustomEvent('app:error', { detail: 'Configure sua Google API Key antes de enviar mensagens.' }))
            return
        }

        setFallbackNotice(null)
        setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, toolCalls: [] }])
        setSending(true)

        const currentToolCalls: ToolCall[] = []

        const onEvent = (event: SSEEvent) => {
            if (event.type === 'model') {
                const { name, slug, attempt, previous_error } = event.data as {
                    name: string; slug: string; attempt: number; previous_error?: string
                }
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') next[next.length - 1] = { ...last, llm_model: slug }
                    return next
                })
                if (attempt > 1) showFallbackNotice(previous_error, name)
            } else if (event.type === 'token') {
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') {
                        next[next.length - 1] = { ...last, content: last.content + (event.data.content as string) }
                    }
                    return next
                })
            } else if (event.type === 'tool_call') {
                const call: ToolCall = {
                    name: event.data.name as string,
                    input: event.data.input as Record<string, unknown>,
                    output: event.data.output as string,
                }
                currentToolCalls.push(call)
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') {
                        next[next.length - 1] = { ...last, toolCalls: [...currentToolCalls] }
                    }
                    return next
                })
            } else if (event.type === 'done') {
                setFallbackNotice(null)
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') {
                        next[next.length - 1] = { ...last, streaming: false }
                    }
                    return next
                })
                setSending(false)
            } else if (event.type === 'error') {
                setFallbackNotice(null)
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') {
                        next[next.length - 1] = {
                            ...last,
                            content: formatSseError(event.data),
                            streaming: false,
                            isError: true,
                            errorCode: event.data.error_code as string | undefined,
                        }
                    }
                    return next
                })
                setSending(false)
            }
        }

        try {
            const gen = retryMessage(conversationId, onEvent)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _ of gen) { /* events processed in onEvent */ }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao reenviar mensagem'
            setMessages(prev => {
                const next = [...prev]
                const last = next[next.length - 1]
                if (last?.role === 'assistant') {
                    next[next.length - 1] = { ...last, content: `Erro: ${msg}`, streaming: false }
                }
                return next
            })
        } finally {
            setSending(false)
            setMessages(prev => {
                const next = [...prev]
                const last = next[next.length - 1]
                if (last?.role === 'assistant' && last.streaming) {
                    next[next.length - 1] = { ...last, streaming: false }
                }
                return next
            })
        }
    }

    function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
        }
    }

    return (
        <div className={styles.chatArea}>
            <div className={styles.messageList}>
                {messages.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyBgIcon}>
                            <Robot weight="duotone" />
                        </div>
                        <div className={styles.emptyContent}>
                            <h2 className={styles.emptyTitle}>Olá, eu sou o Lamarzito!</h2>
                            <p className={styles.emptySubtitle}>
                                Seu tutor de <strong>Organização e Arquitetura de Computadores</strong> da UnB.
                                Tire dúvidas, resolva exercícios e explore os tópicos da disciplina.
                            </p>
                            <div className={styles.suggestionGrid}>
                                {SUGGESTIONS.map(({ Icon, label, description, message }) => (
                                    <button
                                        key={label}
                                        className={styles.suggestionCard}
                                        onClick={() => fillSuggestion(message)}
                                    >
                                        <Icon size={20} weight="duotone" />
                                        <span>{label}</span>
                                        <small>{description}</small>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                            <div className={styles.toolCalls}>
                                {msg.toolCalls.map((call, i) => (
                                    <ToolCallCard key={i} call={call} />
                                ))}
                            </div>
                        )}
                        {msg.role === 'assistant' && msg.streaming && idx === messages.length - 1 && fallbackNotice && (
                            <div className={styles.fallbackNotice}>{fallbackNotice.message}</div>
                        )}
                        <div className={`${styles.bubble} ${msg.isError ? styles.errorBubble : ''}`}>
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                            {msg.streaming && <span className={styles.cursor}>▋</span>}
                        </div>
                        {msg.role === 'assistant' && msg.llm_model && (
                            <span className={styles.modelBadge}>{modelAlias(msg.llm_model)}</span>
                        )}
                        {msg.isError && !sending && (
                            <button className={styles.retryBtn} onClick={handleRetry}>
                                Continuar
                            </button>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className={styles.inputArea}>
                <div className={styles.inputRow}>
                    <textarea
                        ref={textareaRef}
                        className={styles.chatInput}
                        value={input}
                        onChange={e => {
                            setInput(e.target.value)
                            e.target.style.height = 'auto'
                            e.target.style.height = `${e.target.scrollHeight}px`
                        }}
                        onKeyDown={onKeyDown}
                        placeholder="Digite sua dúvida... (Enter para enviar, Shift+Enter para nova linha)"
                        rows={1}
                        disabled={sending}
                    />
                    <button
                        className={styles.sendBtn}
                        onClick={send}
                        disabled={!input.trim() || sending}
                    >
                        <PaperPlaneTilt size={16} weight="fill" />
                    </button>
                </div>
            </div>
        </div>
    )
}
