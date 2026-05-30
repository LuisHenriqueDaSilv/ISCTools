import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { Send, ChevronDown, ChevronUp, Wrench } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getCookie } from '../../utils/cookies'
import { streamMessage, SSEEvent } from '../../services/chat'
import styles from './styles.module.scss'

export interface ChatMessage {
    id?: number
    role: 'user' | 'assistant'
    content: string
    toolCalls?: ToolCall[]
    streaming?: boolean
}

interface ToolCall {
    name: string
    input: Record<string, unknown>
    output: string
}

interface Props {
    conversationId: number
    initialMessages: ChatMessage[]
    onTitleChange?: (title: string) => void
}

function ToolCallCard({ call }: { call: ToolCall }) {
    const [open, setOpen] = useState(false)
    return (
        <div className={styles.toolCard}>
            <button className={styles.toolCardHeader} onClick={() => setOpen(v => !v)}>
                <Wrench size={13} />
                <span>{call.name}</span>
                {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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

export default function ChatArea({ conversationId, initialMessages, onTitleChange }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMessages(initialMessages)
    }, [conversationId, initialMessages])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function send() {
        const content = input.trim()
        if (!content || sending) return

        const model = getCookie('gemini_model') || 'gemini-2.5-flash-lite'
        const apiKey = getCookie('gemini_api_key')

        if (!apiKey) {
            alert('Configure sua Google API Key nas configurações antes de enviar mensagens.')
            return
        }

        setInput('')
        setMessages(prev => [...prev, { role: 'user', content }])

        const assistantIdx = messages.length + 1
        setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, toolCalls: [] }])
        setSending(true)

        const currentToolCalls: ToolCall[] = []

        const onEvent = (event: SSEEvent) => {
            if (event.type === 'title') {
                onTitleChange?.(event.data.title as string)
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
                setMessages(prev => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last?.role === 'assistant') {
                        next[next.length - 1] = {
                            ...last,
                            content: `Erro: ${event.data.message}`,
                            streaming: false,
                        }
                    }
                    return next
                })
                setSending(false)
            }
        }

        try {
            const gen = streamMessage(conversationId, content, model, onEvent)
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
                    <div className={styles.welcomeMsg}>
                        <p>Olá! Sou o Lamarzito, seu tutor de Organização de Computadores.</p>
                        <p>Posso ajudar com RISC-V, conversão de bases, IEEE 754 e muito mais.</p>
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
                        <div className={styles.bubble}>
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                            {msg.streaming && <span className={styles.cursor}>▋</span>}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className={styles.inputArea}>
                <textarea
                    className={styles.chatInput}
                    value={input}
                    onChange={e => setInput(e.target.value)}
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
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}
