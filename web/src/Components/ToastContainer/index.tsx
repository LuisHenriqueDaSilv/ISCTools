import { useEffect, useState } from 'react'
import { X, Warning } from '@phosphor-icons/react'
import styles from './styles.module.scss'

interface Toast {
    id: number
    message: string
}

let _counter = 0
const DISMISS_MS = 5000

export default function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([])

    useEffect(() => {
        function handleError(e: Event) {
            const message = (e as CustomEvent<string>).detail
            const id = ++_counter
            setToasts(prev => [...prev, { id, message }])
            setTimeout(() => dismiss(id), DISMISS_MS)
        }

        window.addEventListener('app:error', handleError)
        return () => window.removeEventListener('app:error', handleError)
    }, [])

    function dismiss(id: number) {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    if (toasts.length === 0) return null

    return (
        <div className={styles.container} role="alert" aria-live="assertive">
            {toasts.map(toast => (
                <div key={toast.id} className={styles.toast}>
                    <Warning size={16} weight="fill" className={styles.icon} />
                    <span className={styles.message}>{toast.message}</span>
                    <button
                        className={styles.closeBtn}
                        onClick={() => dismiss(toast.id)}
                        aria-label="Fechar"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    )
}
