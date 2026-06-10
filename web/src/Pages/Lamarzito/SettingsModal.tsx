import { useEffect, useState } from 'react'
import { X, Eye, EyeSlash, Question } from '@phosphor-icons/react'
import { getCookie, setCookie } from '../../utils/cookies'
import { useCookieConsent } from '../../contexts/CookieConsentContext'
import styles from './styles.module.scss'

interface Props {
    onClose: () => void
    onOpenInfo: () => void
}

export default function SettingsModal({ onClose, onOpenInfo }: Props) {
    const [apiKey, setApiKey] = useState('')
    const [showKey, setShowKey] = useState(false)
    const { requestConsent } = useCookieConsent()

    useEffect(() => {
        setApiKey(getCookie('gemini_api_key'))
    }, [])

    function save() {
        requestConsent(() => {
            setCookie('gemini_api_key', apiKey)
            onClose()
        })
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Google API Key</h3>
                    <button className={styles.iconBtn} onClick={onClose}><X size={18} /></button>
                </div>

                <div className={styles.modalBody}>
                    <button className={styles.byoakInfoBtn} onClick={onOpenInfo}>
                        <Question size={14} weight="bold" />
                        O que é Bring Your Own API Key?
                    </button>
                    <label className={styles.fieldLabel}>Google API Key</label>
                    <div className={styles.apiKeyWrapper}>
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder="AIza..."
                            className={styles.apiKeyInput}
                        />
                        <button className={styles.iconBtn} onClick={() => setShowKey(v => !v)}>
                            {showKey ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <p className={styles.fieldHint}>
                        Obtém sua chave em{' '}
                        <span className={styles.link}>aistudio.google.com</span>.
                        A chave é salva apenas no seu navegador.
                    </p>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={save}>Salvar</button>
                </div>
            </div>
        </div>
    )
}
