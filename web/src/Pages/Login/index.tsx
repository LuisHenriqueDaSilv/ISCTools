import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { SquaresFour, CircleNotch, WarningCircle } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './styles.module.scss'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [hasError, setHasError] = useState(false)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  async function handleSuccess(response: { credential?: string }) {
    if (!response.credential) {
      setHasError(true)
      return
    }
    setHasError(false)
    setIsLoggingIn(true)
    try {
      await login(response.credential)
    } catch {
      setHasError(true)
      setIsLoggingIn(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <SquaresFour size={26} weight="fill" color="var(--dracula-purple)" />
          </div>
          <span className={styles.logoText}>ISCTools</span>
        </div>
        <h1 className={styles.title}>Bem-vindo</h1>
        <p className={styles.subtitle}>
          Faça login para acessar as ferramentas de arquitetura de computadores.
        </p>
        {isLoggingIn ? (
          <div className={styles.loadingState}>
            <CircleNotch size={22} weight="bold" className={styles.spinner} />
            <span>Efetuando login...</span>
          </div>
        ) : (
          <div className={styles.googleButton}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setHasError(true)}
              useOneTap
              size="large"
              width="300"
            />
          </div>
        )}
        {hasError && !isLoggingIn && (
          <div className={styles.errorState} role="alert">
            <WarningCircle size={20} weight="fill" />
            <span>Não foi possível efetuar o login. Tente novamente.</span>
          </div>
        )}
      </div>
    </div>
  )
}
