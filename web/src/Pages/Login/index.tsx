import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './styles.module.scss'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  async function handleSuccess(response: { credential?: string }) {
    if (!response.credential) return
    try {
      await login(response.credential)
    } catch {
      // future: show toast error
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <LayoutDashboard size={32} color="#FFF" />
          </div>
          <span className={styles.logoText}>ISCTools</span>
        </div>
        <h1 className={styles.title}>Bem-vindo</h1>
        <p className={styles.subtitle}>
          Faça login para acessar as ferramentas de arquitetura de computadores.
        </p>
        <div className={styles.googleButton}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => undefined}
            useOneTap
            size="large"
            width="300"
          />
        </div>
      </div>
    </div>
  )
}
