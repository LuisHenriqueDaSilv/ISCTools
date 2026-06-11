import { Plus, ChatText } from '@phosphor-icons/react'
import { ConversationSummary } from '../../services/chat'
import styles from './styles.module.scss'

interface Props {
    conversations: ConversationSummary[]
    activeId: string | null
    onSelect: (id: string) => void
    onNew: () => void
    mobileOpen?: boolean
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function Sidebar({ conversations, activeId, onSelect, onNew, mobileOpen = false }: Props) {
    return (
        <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarMobileOpen : ''}`}>
            <div className={styles.sidebarTop}>
                <button className={styles.newChatBtn} onClick={onNew}>
                    <Plus size={16} />
                    Novo chat
                </button>
            </div>

            <nav className={styles.convList}>
                {conversations.length === 0 && (
                    <p className={styles.emptyState}>você ainda não tem nenhuma conversa com o Lamarzito.</p>
                )}
                {conversations.map(conv => (
                    <button
                        key={conv.id}
                        className={`${styles.convItem} ${conv.id === activeId ? styles.active : ''}`}
                        onClick={() => onSelect(conv.id)}
                    >
                        <ChatText size={14} className={styles.convIcon} />
                        <span className={styles.convTitle}>{conv.title}</span>
                        <span className={styles.convDate}>{formatDate(conv.updated_at)}</span>
                    </button>
                ))}
            </nav>
        </aside>
    )
}
