import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { loginWithGoogle } from '../services/auth'
import { setAuthToken, resetSessionExpiredFlag } from '../services/axios'

interface User {
  id: number
  email: string
  name: string | null
  picture: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  sessionExpired: boolean
  login: (credential: string) => Promise<void>
  logout: () => void
  confirmLogout: () => void
  dismissSessionExpired: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'isctools_token'
const USER_KEY = 'isctools_user'

function decodeJwt(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(window.atob(base64))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const userJson = localStorage.getItem(USER_KEY)
    if (token && userJson) {
      setAuthToken(token)
      setUser(JSON.parse(userJson))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    function handleSessionExpired() {
      setSessionExpired(true)
    }
    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [])

  async function login(credential: string) {
    const googlePayload = decodeJwt(credential) as {
      email: string
      name?: string
      picture?: string
    }

    const { access_token } = await loginWithGoogle(credential)

    const backendPayload = decodeJwt(access_token) as { sub: string; email: string }

    const userData: User = {
      id: Number(backendPayload.sub),
      email: backendPayload.email ?? googlePayload.email,
      name: googlePayload.name ?? null,
      picture: googlePayload.picture ?? null,
    }

    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setAuthToken(access_token)
    setUser(userData)
    resetSessionExpiredFlag()
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuthToken(null)
    setUser(null)
  }

  function confirmLogout() {
    setSessionExpired(false)
    resetSessionExpiredFlag()
    logout()
  }

  function dismissSessionExpired() {
    setSessionExpired(false)
    resetSessionExpiredFlag()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, sessionExpired, login, logout, confirmLogout, dismissSessionExpired }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
