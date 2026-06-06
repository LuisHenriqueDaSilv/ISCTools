import axios, { AxiosError } from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

export function setAuthToken(token: string | null) {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete api.defaults.headers.common['Authorization']
    }
}

// ─── Session expired (401) ────────────────────────────────────────────────────

let sessionExpiredFired = false

export function resetSessionExpiredFlag() {
    sessionExpiredFired = false
}

export function dispatchSessionExpired() {
    if (!sessionExpiredFired) {
        sessionExpiredFired = true
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }
}

// ─── Generic error toasts ─────────────────────────────────────────────────────

type ValidationDetail = { msg: string }[]

function extractMessage(error: AxiosError): string {
    if (!error.response) {
        return 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    }

    const { status, data } = error.response as { status: number; data: { detail?: string | ValidationDetail } }

    if (data?.detail) {
        if (typeof data.detail === 'string') return data.detail
        if (Array.isArray(data.detail)) {
            return data.detail.map(e => e.msg.replace(/^Value error, /, '')).join(' • ')
        }
    }

    if (status === 500) return 'Erro interno no servidor. Tente novamente mais tarde.'
    if (status === 403) return 'Você não tem permissão para realizar esta ação.'
    if (status === 404) return 'Recurso não encontrado.'
    if (status === 422) return 'Dados inválidos na requisição.'

    return `Erro ${status}. Tente novamente.`
}

export function dispatchError(message: string) {
    window.dispatchEvent(new CustomEvent('app:error', { detail: message }))
}

// ─── Interceptor ─────────────────────────────────────────────────────────────

api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
        if (axios.isCancel(error)) return Promise.reject(error)

        if (error.response?.status === 401) {
            dispatchSessionExpired()
        } else {
            dispatchError(extractMessage(error))
        }

        return Promise.reject(error)
    }
)

export default api
