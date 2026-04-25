import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { useAI } from '../hooks/useAI'
import { useProfile } from '../hooks/useProfile'

const SUGGESTIONS = [
  "O que devo fazer agora?",
  "Me dê um resumo das tarefas",
  "Estou me sentindo sobrecarregado"
]

export default function AIAssistant({ tasks }) {
  const { messages, isTyping, sendMessage } = useAI(tasks)
  const { profile } = useProfile()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return
    sendMessage(input)
    setInput('')
  }

  const handleSuggestionClick = (text) => {
    if (isTyping) return
    sendMessage(text)
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Bot size={24} className="text-stone-900" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-100 flex items-center gap-2">
            Seu Assistente <Sparkles size={18} className="text-amber-400" />
          </h2>
          <p className="text-slate-500 text-sm">
            Tire dúvidas, peça resumos e dicas de produtividade.
          </p>
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col relative rounded-2xl border border-white/5">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user'
            return (
              <div key={msg.id} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center border ${
                  isUser 
                    ? 'bg-surface-800 border-white/10' 
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  {isUser ? (
                     profile?.avatar_url ? (
                       <img src={profile.avatar_url} alt="You" className="w-full h-full rounded-full object-cover" />
                     ) : (
                       <User size={14} className="text-slate-400" />
                     )
                  ) : (
                    <Bot size={14} className="text-amber-400" />
                  )}
                </div>
                
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm sm:text-base leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-stone-900 rounded-tr-sm font-medium'
                    : 'bg-surface-800 border border-white/5 text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            )
          })}
          
          {isTyping && (
            <div className="flex gap-4 flex-row">
              <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-amber-500/10 border border-amber-500/30">
                <Bot size={14} className="text-amber-400" />
              </div>
              <div className="bg-surface-800 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-surface-900/50 backdrop-blur-md">
          {/* Sugestões */}
          <div className="flex flex-wrap gap-2 mb-3">
             {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSuggestionClick(s)}
                  disabled={isTyping}
                  className="px-3 py-1.5 text-xs font-medium bg-surface-800 border border-white/10 rounded-full text-slate-300 hover:text-amber-400 hover:border-amber-500/30 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
             ))}
          </div>
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: O que devo fazer agora?"
              className="w-full bg-surface-800/80 border border-surface-700 rounded-xl pl-5 pr-14 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-stone-900 rounded-lg transition-colors"
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
          <div className="mt-2 text-center">
             <span className="text-[10px] text-slate-600">
               O assistente analisa as suas tarefas atuais para te fornecer as melhores dicas.
             </span>
          </div>
        </div>
      </div>
    </div>
  )
}
