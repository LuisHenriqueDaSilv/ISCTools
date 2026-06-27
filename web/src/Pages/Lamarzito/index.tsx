import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { SignIn, CircleNotch, WarningCircle } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import {
    ConversationSummary,
    ModelOption,
    fetchConversation,
    fetchConversations,
    fetchModels,
    toggleModel,
    createConversation,
} from '../../services/chat'
import Sidebar from './Sidebar'
import ChatHeader from './ChatHeader'
import ChatArea, { ChatMessage } from './ChatArea'
import SettingsModal from './SettingsModal'
import BYOAKInfoModal from './BYOAKInfoModal'
import ModelsModal from './ModelsModal'
import styles from './styles.module.scss'

export default function Lamarzito() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { conversationId: paramId } = useParams<{ conversationId?: string }>()

    const [conversations, setConversations] = useState<ConversationSummary[]>([])
    const [models, setModels] = useState<ModelOption[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [showSettings, setShowSettings] = useState(false)
    const [showApiKeyInfo, setShowApiKeyInfo] = useState(false)
    const [showModels, setShowModels] = useState(false)
    const [loading, setLoading] = useState(false)
    const [messagesError, setMessagesError] = useState(false)
    const [conversationsLoading, setConversationsLoading] = useState(false)
    const [conversationsError, setConversationsError] = useState(false)
    const [pendingMessage, setPendingMessage] = useState<string | null>(null)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false)

    useEffect(() => {
        if (!user) return
        fetchModels().then(setModels).catch(() => {})
        loadConversations()
    }, [user])

    useEffect(() => {
        if (!paramId) {
            setActiveId(null)
            setMessages([])
            setPendingMessage(null)
            return
        }

        const state = location.state as { pendingMessage?: string } | null
        const pending = state?.pendingMessage ?? null

        setActiveId(paramId)

        if (pending) {
            // new conversation created from empty state — skip loading (no messages yet)
            setMessages([])
            setPendingMessage(pending)
            navigate(location.pathname, { replace: true, state: {} })
        } else {
            setPendingMessage(null)
            loadMessages(paramId)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramId])

    async function loadConversations() {
        setConversationsLoading(true)
        setConversationsError(false)
        try {
            const data = await fetchConversations()
            setConversations(data)
        } catch {
            setConversationsError(true)
        } finally {
            setConversationsLoading(false)
        }
    }

    async function loadMessages(id: string) {
        setLoading(true)
        setMessagesError(false)
        try {
            const conv = await fetchConversation(id)
            setMessages(conv.messages.map(m => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                llm_model: m.llm_model,
                toolCalls: m.tool_calls.map(tc => ({
                    name: tc.name,
                    input: tc.input,
                    output: tc.output,
                })),
                isError: m.is_error,
                errorCode: m.error_code ?? undefined,
            })))
        } catch {
            setMessages([])
            setMessagesError(true)
        } finally {
            setLoading(false)
        }
    }

    async function handleNew() {
        try {
            const conv = await createConversation()
            const summary: ConversationSummary = {
                id: conv.id,
                title: conv.title,
                updated_at: conv.updated_at,
            }
            setConversations(prev => [summary, ...prev])
            setMobileSidebarOpen(false)
            navigate(`/lamarzito/${conv.id}`)
        } catch {
            // ignore
        }
    }

    async function handleRequestCreate(message: string) {
        try {
            const conv = await createConversation()
            const summary: ConversationSummary = {
                id: conv.id,
                title: conv.title,
                updated_at: conv.updated_at,
            }
            setConversations(prev => [summary, ...prev])
            navigate(`/lamarzito/${conv.id}`, { state: { pendingMessage: message } })
        } catch {
            // ignore
        }
    }

    function handleSelect(id: string) {
        setMobileSidebarOpen(false)
        navigate(`/lamarzito/${id}`)
    }

    function handleTitleChange(title: string) {
        if (!activeId) return
        setConversations(prev =>
            prev.map(c => (c.id === activeId ? { ...c, title } : c))
        )
    }

    async function handleToggleModel(slug: string, enabled: boolean) {
        const previous = models
        setModels(prev => prev.map(m => (m.slug === slug ? { ...m, enabled } : m)))
        try {
            const updated = await toggleModel(slug, enabled)
            setModels(updated)
        } catch {
            setModels(previous)
            window.dispatchEvent(new CustomEvent('app:error', { detail: 'Não foi possível atualizar o modelo. Tente novamente.' }))
        }
    }

    const activeTitle = activeId
        ? (conversations.find(c => c.id === activeId)?.title ?? '')
        : ''

    if (!user) {
        return (
            <div className={styles.loginGate}>
                <div className={styles.loginPrompt}>
                    <div className={styles.loginIcon}><SignIn size={26} /></div>
                    <h3>Login necessário</h3>
                    <p>Faça login para conversar com o Lamarzito.</p>
                    <Link to="/login" className={styles.loginLink}>Entrar com Google</Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.chatLayout}>
            <Sidebar
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
                onNew={handleNew}
                mobileOpen={mobileSidebarOpen}
                loading={conversationsLoading}
                error={conversationsError}
                onRetry={loadConversations}
            />

            {mobileSidebarOpen && (
                <div
                    className={styles.mobileSidebarBackdrop}
                    aria-hidden
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            <main className={styles.chatMain}>
                <ChatHeader
                    title={activeTitle}
                    models={models}
                    onOpenModels={() => { setMobileSettingsOpen(false); setShowModels(true) }}
                    onOpenApiKey={() => { setMobileSettingsOpen(false); setShowSettings(true) }}
                    onOpenApiKeyInfo={() => { setMobileSettingsOpen(false); setShowApiKeyInfo(true) }}
                    mobileSidebarOpen={mobileSidebarOpen}
                    onToggleMobileSidebar={() => setMobileSidebarOpen(v => !v)}
                    mobileSettingsOpen={mobileSettingsOpen}
                    onToggleMobileSettings={() => setMobileSettingsOpen(v => !v)}
                />

                {loading ? (
                    <div className={styles.loadingState}>
                        <CircleNotch size={28} weight="bold" className={styles.spinner} />
                        <span>Carregando conversa...</span>
                    </div>
                ) : messagesError ? (
                    <div className={styles.errorState} role="alert">
                        <WarningCircle size={28} weight="fill" />
                        <span>Não foi possível carregar esta conversa. Tente novamente.</span>
                        <button className={styles.retryBtn} onClick={() => activeId && loadMessages(activeId)}>
                            Tentar novamente
                        </button>
                    </div>
                ) : (
                    <ChatArea
                        key={activeId ?? 'empty'}
                        conversationId={activeId}
                        initialMessages={messages}
                        models={models}
                        onTitleChange={handleTitleChange}
                        onRequestCreate={handleRequestCreate}
                        initialInput={pendingMessage ?? undefined}
                        autoSend={!!pendingMessage}
                    />
                )}
            </main>

            {showSettings && (
                <SettingsModal
                    onClose={() => setShowSettings(false)}
                    onOpenInfo={() => { setShowSettings(false); setShowApiKeyInfo(true) }}
                />
            )}

            {showApiKeyInfo && (
                <BYOAKInfoModal
                    onClose={() => setShowApiKeyInfo(false)}
                    onOpenSettings={() => setShowSettings(true)}
                />
            )}

            {showModels && (
                <ModelsModal
                    models={models}
                    onToggleModel={handleToggleModel}
                    onClose={() => setShowModels(false)}
                />
            )}
        </div>
    )
}
