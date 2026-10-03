import { Cookie, ShieldCheck, X } from '@phosphor-icons/react'
import { useCookieConsent } from '../../contexts/CookieConsentContext'
import styles from './styles.module.scss'

export default function CookieConsent() {
    const { visible, accept, decline } = useCookieConsent()

    if (!visible) return null

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="cookie-title">
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.iconWrap}>
                        <Cookie size={22} weight="duotone" />
                    </div>
                    <h3 id="cookie-title" className={styles.title}>Uso de Cookies</h3>
                </div>

                <div className={styles.body}>
                    <p className={styles.description}>
                        Utilizamos cookies funcionais para melhorar sua experiência no ISCTools.
                        Eles são usados para salvar preferências como sua chave de API e modelo
                        selecionado no Lamarzito — nunca para rastreamento ou fins publicitários.
                    </p>

                    <div className={styles.infoCard}>
                        <ShieldCheck size={16} weight="duotone" className={styles.infoIcon} />
                        <p>
                            Nenhum dado pessoal é enviado a terceiros. Os cookies ficam armazenados
                            apenas no seu navegador.
                        </p>
                    </div>

                    <div className={styles.cookieList}>
                        <span className={styles.cookieListLabel}>Cookies utilizados:</span>
                        <ul>
                            <li><code>gemini_api_key</code> — chave de API do Google AI (Lamarzito)</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.declineBtn} onClick={decline}>
                        <X size={14} />
                        Recusar
                    </button>
                    <button className={styles.acceptBtn} onClick={accept}>
                        <Cookie size={14} weight="fill" />
                        Aceitar cookies
                    </button>
                </div>
            </div>
        </div>
    )
}
