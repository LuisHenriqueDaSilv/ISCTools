import { useEffect, useState } from 'react'
import { X, Eye, EyeSlash, ArrowSquareOut } from '@phosphor-icons/react'
import { getCookie, setCookie } from '../../utils/cookies'
import { useCookieConsent } from '../../contexts/CookieConsentContext'
import styles from './styles.module.scss'

interface Props {
    onClose: () => void
}

const STEPS = [
    'Abra o Google AI Studio e faça login',
    'Clique em "Create API key" e copie a chave gerada (começa com AIza...)',
    'Cole a chave abaixo e salve',
]

export default function SettingsModal({ onClose }: Props) {
    const [apiKey, setApiKey] = useState('')
    const [showKey, setShowKey] = useState(false)
    const { requestConsent, status } = useCookieConsent()

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
                    <h3>Chave de API do Google</h3>
                    <button className={styles.iconBtn} onClick={onClose}><X size={18} /></button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.fieldHint}>
                        Para usar o chat, informe sua própria chave de API do Google. Ela fica salva apenas no seu navegador.
                    </p>

                    <ol className={styles.infoSteps}>
                        {STEPS.map((text, i) => (
                            <li key={i} className={styles.infoStep}>
                                <span className={styles.infoStepNum}>{i + 1}</span>
                                <span className={styles.infoStepText}>
                                    {text}
                                    {i === 0 && (
                                        <>
                                            {' '}
                                            <a
                                                href="https://aistudio.google.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.infoLink}
                                            >
                                                aistudio.google.com
                                                <ArrowSquareOut size={11} />
                                            </a>
                                        </>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ol>

                    {status === 'declined' && (
                        <p className={styles.fieldHint} role="status">
                            Você recusou os cookies, então a chave não pode ser salva. Aceite os cookies ao clicar em Salvar para guardá-la.
                        </p>
                    )}

                    <label className={styles.fieldLabel}>Chave de API</label>
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
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={save}>Salvar</button>
                </div>
            </div>
        </div>
    )
}
