import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { loginWithGoogle } from '../services/auth'
import { resetSessionExpiredFlag } from '../services/axios'
import { getCookie, setCookie, deleteCookie } from '../utils/cookies'

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

const TOKEN_COOKIE = 'isctools_token'
const USER_COOKIE = 'isctools_user'

function decodeJwt(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(window.atob(base64))
}

function readStoredUser(): User | null {
  const token = getCookie(TOKEN_COOKIE)
  const userJson = getCookie(USER_COOKIE)
  if (!token || !userJson) return null
  try {
    return JSON.parse(userJson) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser())
  const [sessionExpired, setSessionExpired] = useState(false)

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

    setCookie(TOKEN_COOKIE, access_token)
    setCookie(USER_COOKIE, JSON.stringify(userData))
    setUser(userData)
    resetSessionExpiredFlag()
  }

  function logout() {
    deleteCookie(TOKEN_COOKIE)
    deleteCookie(USER_COOKIE)
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
    <AuthContext.Provider value={{ user, isLoading: false, sessionExpired, login, logout, confirmLogout, dismissSessionExpired }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
