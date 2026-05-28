import { useEffect, useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { GeminiModel } from '../../services/chat'
import { getCookie, setCookie } from '../../utils/cookies'
import styles from './styles.module.scss'

interface Props {
    models: GeminiModel[]
    onClose: () => void
}

export default function SettingsModal({ models, onClose }: Props) {
    const [apiKey, setApiKey] = useState('')
    const [selectedModel, setSelectedModel] = useState('')
    const [showKey, setShowKey] = useState(false)

    useEffect(() => {
        setApiKey(getCookie('gemini_api_key'))
        setSelectedModel(getCookie('gemini_model') || (models[0]?.id ?? ''))
    }, [models])

    function save() {
        setCookie('gemini_api_key', apiKey)
        setCookie('gemini_model', selectedModel)
        onClose()
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Configurações do Lamarzito</h3>
                    <button className={styles.iconBtn} onClick={onClose}><X size={18} /></button>
                </div>

                <div className={styles.modalBody}>
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
                            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <p className={styles.fieldHint}>
                        Obtém sua chave em{' '}
                        <span className={styles.link}>aistudio.google.com</span>.
                        A chave é salva apenas no seu navegador.
                    </p>

                    <label className={styles.fieldLabel}>Modelo Gemini</label>
                    <select
                        value={selectedModel}
                        onChange={e => setSelectedModel(e.target.value)}
                        className={styles.select}
                    >
                        {models.map(m => (
                            <option key={m.id} value={m.id}>{m.alias}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={save}>Salvar</button>
                </div>
            </div>
        </div>
    )
}
