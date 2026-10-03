import { X, ArrowsClockwise } from '@phosphor-icons/react'
import { ModelOption } from '../../services/chat'
import styles from './styles.module.scss'

interface Props {
    models: ModelOption[]
    onToggleModel: (slug: string, enabled: boolean) => void
    onClose: () => void
}

export default function ModelsModal({ models, onToggleModel, onClose }: Props) {
    const sortedModels = [...models].sort((a, b) => a.priority - b.priority)
    const enabledCount = sortedModels.filter(m => m.enabled).length

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Modelos de IA</h3>
                    <button className={styles.iconBtn} onClick={onClose}><X size={18} /></button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoCardIcon} data-color="purple">
                            <ArrowsClockwise size={20} weight="duotone" />
                        </div>
                        <div>
                            <strong>Como funciona a prioridade?</strong>
                            <p>
                                Os modelos habilitados são tentados <strong>em ordem de prioridade</strong>,
                                do topo para baixo. Se o modelo no topo estiver sem cota ou indisponível,
                                o Lamarzito troca automaticamente para o próximo habilitado — sem você
                                precisar fazer nada. Você só liga/desliga; a ordem é definida pela plataforma.
                            </p>
                        </div>
                    </div>

                    <label className={styles.fieldLabel}>Modelos habilitados</label>
                    <div className={styles.modelToggleList}>
                        {sortedModels.length === 0 ? (
                            <p className={styles.fieldHint}>Nenhum modelo disponível.</p>
                        ) : (
                            sortedModels.map(m => {
                                const isLastEnabled = m.enabled && enabledCount === 1
                                return (
                                    <label key={m.slug} className={styles.modelToggleRow}>
                                        <span>{m.name}</span>
                                        <input
                                            type="checkbox"
                                            checked={m.enabled}
                                            disabled={isLastEnabled}
                                            title={isLastEnabled ? 'Pelo menos um modelo precisa estar ativo' : undefined}
                                            onChange={e => onToggleModel(m.slug, e.target.checked)}
                                        />
                                    </label>
                                )
                            })
                        )}
                    </div>
                    {enabledCount <= 1 && sortedModels.length > 0 && (
                        <p className={styles.fieldHint}>Pelo menos um modelo precisa estar ativo.</p>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.saveBtn} onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    )
}
