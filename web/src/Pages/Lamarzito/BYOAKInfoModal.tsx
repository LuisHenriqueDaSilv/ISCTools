import { X, Key, ArrowSquareOut, Robot, LockKey, CurrencyDollarSimple } from '@phosphor-icons/react'
import styles from './styles.module.scss'

interface Props {
    onClose: () => void
    onOpenSettings: () => void
}

const STEPS = [
    { text: 'Acesse', link: { label: 'aistudio.google.com', href: 'https://aistudio.google.com' } },
    { text: 'Faça login com sua conta Google' },
    { text: 'No menu lateral, clique em "Get API key"' },
    { text: 'Clique em "Create API key" e selecione um projeto Google Cloud' },
    { text: 'Copie a chave gerada — ela começa com AIza...' },
    { text: 'Cole a chave no campo de configuração e salve' },
]

export default function BYOAKInfoModal({ onClose, onOpenSettings }: Props) {
    function handleConfigureClick() {
        onClose()
        onOpenSettings()
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.modal} ${styles.infoModal}`} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Como funciona o sistema de API Key</h3>
                    <button className={styles.iconBtn} onClick={onClose}><X size={18} /></button>
                </div>

                <div className={styles.infoModalBody}>
                    <div className={styles.infoCards}>
                        <div className={styles.infoCard}>
                            <div className={styles.infoCardIcon} data-color="purple">
                                <Robot size={20} weight="duotone" />
                            </div>
                            <div>
                                <strong>O que é?</strong>
                                <p>
                                    Em vez de usar uma chave de API compartilhada no servidor,
                                    cada usuário fornece sua própria chave do Google AI.
                                    Suas conversas são processadas diretamente na sua cota — sem intermediários.
                                </p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoCardIcon} data-color="green">
                                <CurrencyDollarSimple size={20} weight="duotone" />
                            </div>
                            <div>
                                <strong>Por que fizemos isso?</strong>
                                <p>
                                    Para manter o ISCTools <strong>gratuito para todos</strong>.
                                    Manter um servidor com chave própria teria custos crescentes com o uso.
                                    Assim, cada pessoa usa sua cota gratuita do Google AI sem que isso
                                    onere a plataforma.
                                </p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoCardIcon} data-color="cyan">
                                <LockKey size={20} weight="duotone" />
                            </div>
                            <div>
                                <strong>Sua chave é segura?</strong>
                                <p>
                                    Sim. A chave é armazenada <strong>apenas no seu navegador</strong> (cookie local)
                                    e enviada diretamente ao backend para cada requisição.
                                    Ela nunca é persistida em nenhum banco de dados da plataforma.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoStepsSection}>
                        <span className={styles.infoStepsTitle}>Como obter sua chave no Google AI Studio</span>
                        <ol className={styles.infoSteps}>
                            {STEPS.map((step, i) => (
                                <li key={i} className={styles.infoStep}>
                                    <span className={styles.infoStepNum}>{i + 1}</span>
                                    <span className={styles.infoStepText}>
                                        {step.text}
                                        {step.link && (
                                            <>
                                                {' '}
                                                <a
                                                    href={step.link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.infoLink}
                                                >
                                                    {step.link.label}
                                                    <ArrowSquareOut size={11} />
                                                </a>
                                            </>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Fechar</button>
                    <button className={styles.saveBtn} onClick={handleConfigureClick}>
                        <Key size={14} />
                        Configurar minha API Key
                    </button>
                </div>
            </div>
        </div>
    )
}
