"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Key } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../lamarzito/styles.module.scss";

const API_KEY_STORAGE = "lamarzito_tutor_gemini_key";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function LamarzitoTutorPage() {
  const [apiKey, setApiKeyState] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou o Lamarzito-Tutor, professor da disciplina. Coloca a tua chave Gemini acima para começarmos. Só respondo a dúvidas sobre a disciplina (ISC/OAC).",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(API_KEY_STORAGE);
      if (stored) {
        setApiKeyState(stored);
        setApiKeySaved(true);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveApiKey = () => {
    const key = apiKeyInput.trim();
    if (!key) return;
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKeyState(key);
    setApiKeyInput("");
    setApiKeySaved(true);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          text: "Guarda primeiro a tua chave Gemini no campo acima.",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMessageText = inputText;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          conversationId: conversationId ?? undefined,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao obter resposta");
      }

      setConversationId(data.conversationId);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          error instanceof Error
            ? error.message
            : "Desculpe, tive um problema ao processar. Verifica a chave Gemini e a ligação à base de dados.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([
      {
        id: "1",
        text: "Nova conversa iniciada. Em que posso ajudar?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.pageTitle}>
          <Bot className={styles.icon} size={24} />
          <h1>Lamarzito-Tutor</h1>
        </div>
        <p>Professor de IA para dúvidas de ISC/OAC. Usa a tua chave Gemini (BYOK).</p>
        <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          {!apiKeySaved ? (
            <>
              <input
                type="password"
                placeholder="Chave API Gemini"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className={styles.chatInput}
                style={{ maxWidth: 280 }}
              />
              <button type="button" onClick={saveApiKey} className={styles.sendButton}>
                <Key size={16} style={{ marginRight: 4 }} />
                Guardar
              </button>
            </>
          ) : (
            <span style={{ color: "var(--accent-mint)", fontSize: "1.2rem" }}>
              Chave Gemini guardada
            </span>
          )}
          {conversationId && (
            <button
              type="button"
              onClick={startNewConversation}
              className={styles.sendButton}
              style={{ marginLeft: "auto" }}
            >
              Nova conversa
            </button>
          )}
        </div>
      </header>

      <div className={styles.chatContainer}>
        <div className={styles.messagesList}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageWrapper} ${styles[message.sender]}`}
            >
              <div className={styles.messageBubble}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>
              </div>
              <span className={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.messageWrapper} ${styles.ai}`}>
              <div className={styles.messageBubble}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Lamarzito-Tutor está a pensar...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className={styles.inputArea}>
          <input
            type="text"
            className={styles.chatInput}
            placeholder="Digite sua dúvida sobre a disciplina..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!inputText.trim() || isTyping}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
