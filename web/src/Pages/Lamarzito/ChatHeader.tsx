import { useEffect, useRef } from 'react'
import { Key, Question, CaretDown, CaretUp, Gear, X, Robot } from '@phosphor-icons/react'
import { ModelOption } from '../../services/chat'
import styles from './styles.module.scss'

interface Props {
    title: string
    models: ModelOption[]
    onOpenModels: () => void
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
    onOpenModels,
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

    const enabledModels = [...models].filter(m => m.enabled).sort((a, b) => a.priority - b.priority)
    const primaryModel = enabledModels[0]
    const extraCount = enabledModels.length - 1

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
                <button type="button" className={styles.modelToggleBtn} onClick={onOpenModels}>
                    <Robot size={14} />
                    <span>{primaryModel ? primaryModel.name : 'Nenhum modelo'}</span>
                    {extraCount > 0 && <span className={styles.modelToggleExtra}>+{extraCount}</span>}
                </button>
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
