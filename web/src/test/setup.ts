import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

// jsdom não implementa scrollIntoView, usado pelo ChatArea para rolar até a última mensagem
Element.prototype.scrollIntoView = () => {}
