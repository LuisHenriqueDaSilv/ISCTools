import { useNavigate } from 'react-router-dom'
import { Warning } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './styles.module.scss'

export default function SessionExpiredToast() {
    const { sessionExpired, confirmLogout, dismissSessionExpired } = useAuth()
    const navigate = useNavigate()

    if (!sessionExpired) return null

    function handleConfirm() {
        confirmLogout()
        navigate('/login')
    }

    return (
        <div className={styles.toast} role="alertdialog" aria-modal="false">
            <div className={styles.icon}>
                <Warning size={20} weight="fill" />
            </div>
            <div className={styles.body}>
                <p className={styles.title}>Sessão encerrada</p>
                <p className={styles.message}>Sua sessão expirou. Faça login novamente para continuar.</p>
                <div className={styles.actions}>
                    <button className={styles.dismissBtn} onClick={dismissSessionExpired}>
                        Cancelar
                    </button>
                    <button className={styles.loginBtn} onClick={handleConfirm}>
                        Fazer login
                    </button>
                </div>
            </div>
        </div>
    )
}
