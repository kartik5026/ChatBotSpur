import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from './lib/api'

type ChatMessage = {
  id: string
  sender: 'user' | 'ai'
  text: string
  createdAt: string
}

const SESSION_KEY = 'spur_takehome_session_id'

function App() {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_KEY)
  })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const shouldAutoScrollRef = useRef(true)

  const canSend = useMemo(() => {
    const t = draft.trim()
    return t.length > 0
  }, [draft, isSending])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    if (shouldAutoScrollRef.current) el.scrollTop = el.scrollHeight
  }, [messages, isSending])

  useEffect(() => {
    if (!sessionId) return
    let ignore = false

    async function run() {
      setError(null)
      try {
        const res = await api.get<{ sessionId: string; messages: ChatMessage[] }>(
          `/api/v1/chat/history`,
          { params: { sessionId } },
        )
        const data = res.data
        if (ignore) return
        setMessages(data.messages ?? [])
      } catch {
        if (ignore) return
        setError('Failed to load chat history.')
      }
    }

    void run()
    return () => {
      ignore = true
    }
  }, [sessionId])

  async function send(messageOverride?: string) {
    const text = (messageOverride ?? draft).trim()
    if (text.length === 0 || isSending) return
    if (text.length > 4000) {
      setError('Message too long (max 4000 characters).')
      return
    }

    setIsSending(true)
    setError(null)
    setDraft('')
    requestAnimationFrame(() => inputRef.current?.focus())

    const now = new Date().toISOString()
    setMessages((prev) => [...prev, { id: `${now}-user`, sender: 'user', text, createdAt: now }])

    try {
      const res = await api.post<{ reply: string; sessionId: string }>(`/api/v1/chat/message`, {
        message: text,
        sessionId: sessionId ?? undefined,
      })
      const data = res.data

      // Ensure sessionId persisted
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId)
        localStorage.setItem(SESSION_KEY, data.sessionId)
      }

      setMessages((prev) => [
        ...prev,
        { id: `${now}-ai`, sender: 'ai', text: data.reply ?? '', createdAt: now },
      ])
    } catch {
      const errNow = new Date().toISOString()
      setMessages((prev) => [
        ...prev,
        {
          id: `${errNow}-ai`,
          sender: 'ai',
          text: 'Sorry — I could not send that message. Please try again.',
          createdAt: errNow,
        },
      ])
    } finally {
      setIsSending(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <p className="m-0 text-base font-semibold">Spur — AI Support Chat</p>
          <p className="m-0 text-xs text-slate-300">Ask about shipping, returns, support hours.</p>
        </div>
        <button
          type="button"
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          onClick={() => {
            localStorage.removeItem(SESSION_KEY)
            setSessionId(null)
            setMessages([])
            setDraft('')
            requestAnimationFrame(() => inputRef.current?.focus())
          }}
        >
          New chat
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm">
        <div
          className="flex h-[520px] flex-col gap-3 overflow-auto p-4"
          ref={listRef}
          onScroll={() => {
            const el = listRef.current
            if (!el) return
            const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
            shouldAutoScrollRef.current = distanceFromBottom < 120
          }}
        >
          {messages.length === 0 ? (
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-xl border border-white/10 bg-white/5 px-3 py-2 whitespace-pre-wrap break-words">
                Hi! I’m your support agent. Try: “Do you ship to USA?” or “What’s your return policy?”
              </div>
            </div>
          ) : null}

          {messages.length === 0 ? (
            <div className="mb-3 mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:border-indigo-400/80"
                onClick={() => void send('Do you ship to USA?')}
              >
                Do you ship to USA?
              </button>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:border-indigo-400/80"
                onClick={() => void send("What's your return policy?")}
              >
                Return policy
              </button>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:border-indigo-400/80"
                onClick={() => void send('What are your support hours?')}
              >
                Support hours
              </button>
            </div>
          ) : null}

          {messages.map((m) => (
            <div key={m.id} className={m.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={[
                  'max-w-[90%] whitespace-pre-wrap break-words rounded-xl border px-3 py-2',
                  m.sender === 'user'
                    ? 'border-indigo-400/20 bg-indigo-500/20'
                    : 'border-white/10 bg-white/5',
                ].join(' ')}
              >
                {m.text}
                <div className="mt-1 text-[11px] text-slate-300/80">
                  {m.sender === 'user' ? 'You' : 'Agent'} • {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isSending ? (
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="inline-flex gap-1 opacity-80" aria-label="Agent is typing">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:150ms]">.</span>
                  <span className="animate-bounce [animation-delay:300ms]">.</span>
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {error ? <div className="px-4 pb-2 text-xs text-rose-300">{error}</div> : null}

        <div className="flex items-end gap-2 border-t border-white/10 p-3">
          <textarea
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-indigo-400/80"
            value={draft}
            placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            ref={inputRef}
            rows={2}
          />
          <button
            className="rounded-xl bg-indigo-500/80 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
            type="button"
            disabled={!canSend || isSending}
            onClick={() => void send()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
