'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  sources?: { title: string; url: string; source: string }[]
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
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-6">
      {/* Header */}
      <div className="py-8 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white tracking-tight">Ask AI</h1>
        <p className="text-[rgba(235,235,245,0.5)] text-sm mt-1">
          Ask anything — answers are grounded in your curated news feed
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3 mt-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(235,235,245,0.3)] mb-1">
              Suggested
            </p>
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-[rgba(84,84,88,0.45)] rounded-xl px-4 py-3 text-sm text-[rgba(235,235,245,0.7)] hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            {msg.role === 'user' ? (
              <div className="max-w-[80%] bg-accent rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white font-medium">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[90%] flex flex-col gap-3">
                <div className="bg-[#1c1c1e] border border-[rgba(84,84,88,0.45)] rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-[rgba(235,235,245,0.85)] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(235,235,245,0.3)]">
                      Sources
                    </p>
                    {msg.sources.slice(0, 4).map((src, j) => (
                      <a
                        key={j}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 bg-[#1c1c1e] border border-[rgba(84,84,88,0.45)] rounded-lg px-3 py-2 hover:bg-[#2c2c2e] transition-colors group"
                      >
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wide mt-0.5 flex-shrink-0">
                          {src.source}
                        </span>
                        <span className="text-xs text-[rgba(235,235,245,0.6)] group-hover:text-white transition-colors leading-snug">
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
            <div className="bg-[#1c1c1e] border border-[rgba(84,84,88,0.45)] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-[rgba(235,235,245,0.4)] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[rgba(235,235,245,0.4)] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[rgba(235,235,245,0.4)] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pb-6 pt-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the news..."
            disabled={loading}
            className="flex-1 bg-[#1c1c1e] border border-[rgba(84,84,88,0.65)] rounded-xl px-4 py-3 text-sm text-white placeholder-[rgba(235,235,245,0.3)] outline-none focus:border-accent/60 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
