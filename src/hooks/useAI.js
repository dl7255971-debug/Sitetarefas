import { useState, useCallback } from 'react'

const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const API_URL = "https://api.groq.com/openai/v1/chat/completions"
const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
const FALLBACK_MODEL = "llama-3.3-70b-versatile"

const formatTasksForAI = (currentTasks) => {
  if (!currentTasks || currentTasks.length === 0) {
    return 'O usuário não tem nenhuma tarefa criada no momento.'
  }
  return currentTasks
    .map((t, idx) => {
      const status = t.completed ? 'Concluída' : 'Pendente'
      const archived = t.archived ? ' (Arquivada)' : ''
      const date = t.dueDate ? ` | Prazo: ${t.dueDate}` : ''
      const time = t.due_time ? ` às ${t.due_time.substring(0, 5)}` : ''
      const priority = ` | Prioridade: ${t.priority || 'média'}`
      const category = ` | Categoria: ${t.category || 'pessoal'}`
      const desc = t.description ? ` | Descrição: ${t.description}` : ''
      const steps = t.subtasks && t.subtasks.length > 0 
        ? ` | Etapas: ${t.subtasks.map(s => `${s.title} [${s.completed ? 'Concluída' : 'Pendente'}]`).join(', ')}`
        : ''
      return `${idx + 1}. [${status}] "${t.title}"${archived}${category}${priority}${date}${time}${desc}${steps}`
    })
    .join('\n')
}

export function useAI(tasks) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou seu assistente de produtividade. Como posso te ajudar com suas tarefas hoje?',
      timestamp: new Date().toISOString()
    }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const callGroqAPI = async (chatMessages, model) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: chatMessages
      })
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return

    const newUserMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, newUserMessage])
    setIsTyping(true)

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      history.push({ role: 'user', content: text })

      const systemPrompt = {
        role: 'system',
        content: `Você é um assistente de produtividade amigável, direto e útil. Responda sempre em português.
Você tem acesso em tempo real à lista atual de tarefas do usuário. Responda a qualquer dúvida, analise a produtividade dele, dê conselhos de priorização e seja solícito.

Abaixo está a lista atualizada de tarefas do usuário:
${formatTasksForAI(tasks)}

Instruções adicionais:
1. Responda de forma clara, amigável e objetiva.
2. Use formatação em Markdown (negritos, listas, tabelas) para deixar as respostas atraentes e fáceis de ler.
3. Se o usuário estiver sobrecarregado, ajude-o a focar em apenas uma tarefa simples.`
      }

      const fullMessagesPayload = [systemPrompt, ...history]

      let botReplyContent = ''
      try {
        botReplyContent = await callGroqAPI(fullMessagesPayload, DEFAULT_MODEL)
      } catch (err) {
        console.warn(`Falha com o modelo padrão ${DEFAULT_MODEL}. Tentando modelo fallback...`, err)
        botReplyContent = await callGroqAPI(fullMessagesPayload, FALLBACK_MODEL)
      }

      const newAIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: botReplyContent,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, newAIMessage])
    } catch (error) {
      console.error('Erro na chamada da API da Groq:', error)
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ Desculpe, ocorreu um erro ao me comunicar com a API do assistente de produtividade. Verifique se a sua chave API e conexão de internet estão funcionando.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }, [messages, tasks])

  return {
    messages,
    isTyping,
    sendMessage
  }
}
