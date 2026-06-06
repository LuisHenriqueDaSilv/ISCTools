import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'

const CONSENT_KEY = 'cookie_consent'

export type ConsentStatus = 'accepted' | 'declined' | null

export function getConsentStatus(): ConsentStatus {
    return localStorage.getItem(CONSENT_KEY) as ConsentStatus
}

interface CookieConsentContextType {
    status: ConsentStatus
    isAllowed: boolean
    visible: boolean
    requestConsent: (onAccept?: () => void) => void
    accept: () => void
    decline: () => void
}

const CookieConsentContext = createContext<CookieConsentContextType | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<ConsentStatus>(() => getConsentStatus())
    const [visible, setVisible] = useState(() => !getConsentStatus())
    const pendingCallback = useRef<(() => void) | null>(null)

    useEffect(() => {
        if (!getConsentStatus()) setVisible(true)
    }, [])

    function requestConsent(onAccept?: () => void) {
        if (status === 'accepted') {
            onAccept?.()
            return
        }
        pendingCallback.current = onAccept ?? null
        setVisible(true)
    }

    function accept() {
        localStorage.setItem(CONSENT_KEY, 'accepted')
        setStatus('accepted')
        setVisible(false)
        pendingCallback.current?.()
        pendingCallback.current = null
    }

    function decline() {
        localStorage.setItem(CONSENT_KEY, 'declined')
        setStatus('declined')
        setVisible(false)
        pendingCallback.current = null
    }

    return (
        <CookieConsentContext.Provider value={{
            status,
            isAllowed: status === 'accepted',
            visible,
            requestConsent,
            accept,
            decline,
        }}>
            {children}
        </CookieConsentContext.Provider>
    )
}

export function useCookieConsent() {
    const ctx = useContext(CookieConsentContext)
    if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
    return ctx
}
