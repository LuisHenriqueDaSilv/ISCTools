import { Key, Question } from '@phosphor-icons/react'
import { GeminiModel } from '../../services/chat'
import styles from './styles.module.scss'

interface Props {
    title: string
    models: GeminiModel[]
    selectedModel: string
    onModelChange: (model: string) => void
    onOpenApiKey: () => void
    onOpenApiKeyInfo: () => void
}

export default function ChatHeader({ title, models, selectedModel, onModelChange, onOpenApiKey, onOpenApiKeyInfo }: Props) {
    return (
        <div className={styles.chatHeader}>
            <span className={styles.chatHeaderTitle}>{title || 'Novo chat'}</span>
            <select
                className={styles.headerModelSelect}
                value={selectedModel}
                onChange={e => onModelChange(e.target.value)}
            >
                {models.map(m => (
                    <option key={m.id} value={m.id}>{m.alias}</option>
                ))}
            </select>
            <button className={styles.apiKeyBtn} onClick={onOpenApiKey}>
                <Key size={14} />
                API Key
            </button>
            <button
                className={styles.iconBtn}
                onClick={onOpenApiKeyInfo}
                title="Como funciona o sistema de API Key"
            >
                <Question size={16} />
            </button>
        </div>
    )
}
