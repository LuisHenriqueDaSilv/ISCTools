import { useEffect, useRef } from 'react'
import { Key, Question, CaretDown, CaretUp, Gear, X } from '@phosphor-icons/react'
import { GeminiModel } from '../../services/chat'
import styles from './styles.module.scss'

interface Props {
    title: string
    models: GeminiModel[]
    selectedModel: string
    onModelChange: (model: string) => void
    onOpenApiKey: () => void
    onOpenApiKeyInfo: () => void
    mobileSidebarOpen: boolean
    onToggleMobileSidebar: () => void
    mobileSettingsOpen: boolean
    onToggleMobileSettings: () => void
}

export default function ChatHeader({
    title,
    models,
    selectedModel,
    onModelChange,
    onOpenApiKey,
    onOpenApiKeyInfo,
    mobileSidebarOpen,
    onToggleMobileSidebar,
    mobileSettingsOpen,
    onToggleMobileSettings,
}: Props) {
    const settingsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!mobileSettingsOpen) return
        function onDocClick(e: MouseEvent) {
            if (!settingsRef.current) return
            if (!settingsRef.current.contains(e.target as Node)) {
                onToggleMobileSettings()
            }
        }
        document.addEventListener('mousedown', onDocClick)
        return () => document.removeEventListener('mousedown', onDocClick)
    }, [mobileSettingsOpen, onToggleMobileSettings])

    return (
        <div className={styles.chatHeader}>
            <button
                type="button"
                className={`${styles.headerSettingsBtn} ${mobileSettingsOpen ? styles.headerSettingsBtnActive : ''}`}
                onClick={onToggleMobileSettings}
                aria-expanded={mobileSettingsOpen}
                aria-label="Configurações do chat"
                title="Configurações"
            >
                {mobileSettingsOpen ? <X size={16} /> : <Gear size={16} />}
            </button>

            <button
                type="button"
                className={styles.chatHeaderTitleBtn}
                onClick={onToggleMobileSidebar}
                aria-expanded={mobileSidebarOpen}
                aria-label={mobileSidebarOpen ? 'Fechar lista de chats' : 'Abrir lista de chats'}
            >
                <span className={styles.chatHeaderTitle}>{title || 'Novo chat'}</span>
                <span className={styles.chatHeaderTitleCaret} aria-hidden>
                    {mobileSidebarOpen ? <CaretUp size={14} /> : <CaretDown size={14} />}
                </span>
            </button>

            <div
                ref={settingsRef}
                className={`${styles.headerControls} ${mobileSettingsOpen ? styles.headerControlsOpen : ''}`}
            >
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
        </div>
    )
}
