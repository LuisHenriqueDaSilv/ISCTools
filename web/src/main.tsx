import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import { CookieConsentProvider } from './contexts/CookieConsentContext'
import App from './App.tsx'

import './styles/global.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CookieConsentProvider>
          <App />
        </CookieConsentProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
