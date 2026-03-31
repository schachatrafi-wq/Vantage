'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  sources?: { title: string; url: string; source: string }[]
}

function renderJournalisticText(text: string): ReactNode {
  const paragraphs = text.split(/\n\n+/).filter(Boolean)
  return paragraphs.map((para, pi) => {
    // Split on **bold** markers
    const parts = para.split(/\*\*([^*]+)\*\*/)
    const inline = parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    )
    return (
      <p key={pi} style={{ marginBottom: pi < paragraphs.length - 1 ? '1em' : 0 }}>
        {inline}
      </p>
    )
  })
}

const SUGGESTED = [
  'What are the biggest AI developments this week?',
  'Summarize the latest geopolitical tensions',
  "What's happening in the stock market?",
  'Any major cybersecurity threats recently?',
]

export default function AskAIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return

    const userMessage: Message = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="py-8 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Ask AI</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Ask anything — answers are grounded in your curated news feed
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: 'var(--muted-2)' }}
            >
              Suggested
            </p>
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="glass text-left rounded-xl px-4 py-3 text-sm transition-all duration-150"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                  e.currentTarget.style.color = 'var(--foreground)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = ''
                  e.currentTarget.style.color = 'var(--muted)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            {msg.role === 'user' ? (
              <div
                className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white font-medium"
                style={{
                  background: 'linear-gradient(135deg, #FF375F 0%, #C42850 100%)',
                  boxShadow: '0 2px 12px rgba(255,55,95,0.28)',
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[90%] flex flex-col gap-3">
                <div
                  className="glass rounded-2xl rounded-bl-sm px-5 py-4"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-playfair), Georgia, "Times New Roman", serif',
                    fontSize: '15px',
                    lineHeight: '1.75',
                    letterSpacing: '0.01em',
                  }}
                >
                  {renderJournalisticText(msg.content)}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--muted-2)' }}
                    >
                      Sources
                    </p>
                    {msg.sources.slice(0, 4).map((src, j) => (
                      <a
                        key={j}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass flex items-start gap-2 rounded-lg px-3 py-2 transition-all duration-150"
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide mt-0.5 flex-shrink-0"
                          style={{ color: 'var(--accent)' }}
                        >
                          {src.source}
                        </span>
                        <span className="text-xs leading-snug" style={{ color: 'var(--muted)' }}>
                          {src.title}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="glass rounded-2xl rounded-bl-sm px-4 py-3"
            >
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: 'var(--muted-2)' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: 'var(--muted-2)' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: 'var(--muted-2)' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 pb-6 pt-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the news..."
            disabled={loading}
            className="input-glass flex-1 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-accent rounded-xl px-4 py-3 text-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
