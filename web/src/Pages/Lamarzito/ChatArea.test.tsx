import { render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ChatArea from './ChatArea'

const models = [{ slug: 'gemini-test', name: 'Teste', priority: 1, enabled: true }]

function renderChat(onConfigureKey = vi.fn(), onRequestCreate = vi.fn()) {
    render(
        <ChatArea
            conversationId={null}
            initialMessages={[]}
            models={models}
            onRequestCreate={onRequestCreate}
            onConfigureKey={onConfigureKey}
        />,
    )
    return { onConfigureKey, onRequestCreate }
}

function setKey(value: string) {
    document.cookie = `gemini_api_key=${encodeURIComponent(value)}; path=/`
}

function clearKey() {
    document.cookie = 'gemini_api_key=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
}

describe('ChatArea — chave de API do Google', () => {
    afterEach(() => clearKey())

    it('sem chave: campo desabilitado, sem botão de envio e com botão de configurar', () => {
        clearKey()
        const { onConfigureKey } = renderChat()

        const input = screen.getByRole('textbox')
        expect(input).toBeDisabled()
        expect(input).toHaveAttribute('placeholder', expect.stringContaining('Configure sua Chave de API'))
        expect(screen.queryByRole('button', { name: /enviar|send/i })).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Configurar chave' }))
        expect(onConfigureKey).toHaveBeenCalledTimes(1)
    })

    it('sem chave: nenhuma conversa é criada ao tentar enviar', () => {
        clearKey()
        const { onRequestCreate } = renderChat()

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'olá' } })
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })

        expect(onRequestCreate).not.toHaveBeenCalled()
    })

    it('com chave: campo habilitado, sem botão de configurar, e envio liberado', () => {
        setKey('AIza-chave-de-teste')
        const { onRequestCreate } = renderChat()

        const input = screen.getByRole('textbox')
        expect(input).toBeEnabled()
        expect(screen.queryByRole('button', { name: 'Configurar chave' })).not.toBeInTheDocument()

        fireEvent.change(input, { target: { value: 'olá' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onRequestCreate).toHaveBeenCalledWith('olá')
    })
})
