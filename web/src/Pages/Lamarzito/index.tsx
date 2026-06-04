import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SignIn } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import {
    ConversationSummary,
    GeminiModel,
    fetchConversation,
    fetchConversations,
    fetchModels,
    createConversation,
} from '../../services/chat'
import Sidebar from './Sidebar'
import ChatArea, { ChatMessage } from './ChatArea'
import SettingsModal from './SettingsModal'
import styles from './styles.module.scss'

export default function Lamarzito() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { conversationId: paramId } = useParams<{ conversationId?: string }>()

    const [conversations, setConversations] = useState<ConversationSummary[]>([])
    const [models, setModels] = useState<GeminiModel[]>([])
    const [activeId, setActiveId] = useState<number | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [showSettings, setShowSettings] = useState(false)
    const [loading, setLoading] = useState(false)

    // Bootstrap: load models and conversation list
    useEffect(() => {
        if (!user) return
        fetchModels().then(setModels).catch(() => {})
        loadConversations()
    }, [user])

    // When URL param changes, load that conversation
    useEffect(() => {
        if (!paramId) {
            setActiveId(null)
            setMessages([])
            return
        }
        const id = Number(paramId)
        if (isNaN(id)) return
        setActiveId(id)
        loadMessages(id)
    }, [paramId])

    async function loadConversations() {
        try {
            const data = await fetchConversations()
            setConversations(data)
        } catch {
            // ignore
        }
    }

    async function loadMessages(id: number) {
        setLoading(true)
        try {
            const conv = await fetchConversation(id)
            setMessages(conv.messages.map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content })))
        } catch {
            setMessages([])
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
            navigate(`/lamarzito/${conv.id}`)
        } catch {
            // ignore
        }
    }

    function handleSelect(id: number) {
        navigate(`/lamarzito/${id}`)
    }

    function handleTitleChange(title: string) {
        if (!activeId) return
        setConversations(prev =>
            prev.map(c => (c.id === activeId ? { ...c, title } : c))
        )
    }

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
                onSettings={() => setShowSettings(true)}
            />

            <main className={styles.chatMain}>
                {activeId ? (
                    loading ? (
                        <div className={styles.loadingState}>Carregando conversa...</div>
                    ) : (
                        <ChatArea
                            key={activeId}
                            conversationId={activeId}
                            initialMessages={messages}
                            onTitleChange={handleTitleChange}
                        />
                    )
                ) : (
                    <div className={styles.noConvSelected}>
                        <p>Selecione um chat ou crie um novo para começar.</p>
                        <button className={styles.newChatCta} onClick={handleNew}>
                            Iniciar novo chat
                        </button>
                    </div>
                )}
            </main>

            {showSettings && (
                <SettingsModal models={models} onClose={() => setShowSettings(false)} />
            )}
        </div>
    )
}
