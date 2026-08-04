import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeChatMessages, sendMessage, type ChatMessage } from '../lib/chat'

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chatId) return
    return subscribeChatMessages(chatId, setMessages)
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!text.trim() || !chatId || !user) return
    const value = text
    setText('')
    await sendMessage(chatId, user.uid, value)
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">المحادثة</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && <p className="py-12 text-center text-text-secondary">ابدأ المحادثة بأول رسالة</p>}
        {messages.map((m) => {
          const isMe = m.senderId === user?.uid
          return (
            <div key={m.id} className={`mb-2 flex ${isMe ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe ? 'bg-primary text-white' : 'border border-border bg-white text-text-primary'
                }`}
              >
                <p>{m.text}</p>
                <p className={`mt-1 text-xs ${isMe ? 'text-white/70' : 'text-text-secondary'}`}>
                  {new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' }).format(m.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </main>

      <form onSubmit={handleSend} className="flex gap-3 border-t border-border bg-white p-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 rounded-full border-2 border-border px-4 py-2.5 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white disabled:bg-disabled"
        >
          ➤
        </button>
      </form>
    </div>
  )
}
