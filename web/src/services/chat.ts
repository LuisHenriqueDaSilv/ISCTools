import api from './axios'
import { dispatchSessionExpired } from './axios'
import { getCookie } from '../utils/cookies'

export interface ConversationSummary {
    id: string
    title: string
    updated_at: string
}

export interface ApiToolCall {
    id: number
    name: string
    input: Record<string, unknown>
    output: string
}

export interface Message {
    id: number
    role: 'user' | 'assistant'
    content: string
    llm_model: string | null
    tool_calls: ApiToolCall[]
    is_error: boolean
    error_code: string | null
}

export interface ConversationDetail {
    id: string
    title: string
    created_at: string
    updated_at: string
    messages: Message[]
}

export interface GeminiModel {
    id: string
    alias: string
}

export interface SSEEvent {
    type: 'title' | 'token' | 'tool_call' | 'done' | 'error'
    data: Record<string, unknown>
}

export async function fetchModels(): Promise<GeminiModel[]> {
    const { data } = await api.get('/chat/models')
    return data
}

export async function createConversation(): Promise<ConversationDetail> {
    const { data } = await api.post('/chat/conversations')
    return data
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
    const { data } = await api.get('/chat/conversations')
    return data
}

export async function fetchConversation(id: string): Promise<ConversationDetail> {
    const { data } = await api.get(`/chat/conversations/${id}`)
    return data
}

export async function* retryMessage(
    conversationId: string,
    model: string,
    onEvent: (event: SSEEvent) => void,
): AsyncGenerator<void> {
    const token = getCookie('isctools_token')
    const apiKey = getCookie('gemini_api_key')

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/conversations/${conversationId}/retry`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'X-Google-Api-Key': apiKey,
            },
            body: JSON.stringify({ model }),
        },
    )

    if (!response.ok) {
        if (response.status === 401) dispatchSessionExpired()
        const err = await response.json().catch(() => ({ detail: 'Erro desconhecido' }))
        throw new Error(err.detail ?? `HTTP ${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const messages = buffer.split('\n\n')
        buffer = messages.pop() ?? ''

        for (const message of messages) {
            let eventType = 'message'
            let dataStr = ''
            for (const line of message.split('\n')) {
                if (line.startsWith('event: ')) eventType = line.slice(7).trim()
                else if (line.startsWith('data: ')) dataStr = line.slice(6).trim()
            }
            if (dataStr) {
                try {
                    const parsed = JSON.parse(dataStr)
                    onEvent({ type: eventType as SSEEvent['type'], data: parsed })
                } catch {
                    // ignore malformed event
                }
            }
        }
        yield
    }
}

export async function* streamMessage(
    conversationId: string,
    content: string,
    model: string,
    onEvent: (event: SSEEvent) => void,
): AsyncGenerator<void> {
    const token = getCookie('isctools_token')
    const apiKey = getCookie('gemini_api_key')

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/conversations/${conversationId}/messages`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'X-Google-Api-Key': apiKey,
            },
            body: JSON.stringify({ content, model }),
        },
    )

    if (!response.ok) {
        if (response.status === 401) dispatchSessionExpired()
        const err = await response.json().catch(() => ({ detail: 'Erro desconhecido' }))
        throw new Error(err.detail ?? `HTTP ${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const messages = buffer.split('\n\n')
        buffer = messages.pop() ?? ''

        for (const message of messages) {
            let eventType = 'message'
            let dataStr = ''
            for (const line of message.split('\n')) {
                if (line.startsWith('event: ')) eventType = line.slice(7).trim()
                else if (line.startsWith('data: ')) dataStr = line.slice(6).trim()
            }
            if (dataStr) {
                try {
                    const parsed = JSON.parse(dataStr)
                    onEvent({ type: eventType as SSEEvent['type'], data: parsed })
                } catch {
                    // ignore malformed event
                }
            }
        }
        yield
    }
}
