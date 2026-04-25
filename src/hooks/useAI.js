import { useState, useCallback } from 'react'

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

  const generateResponse = (userMessage, currentTasks) => {
    const text = userMessage.toLowerCase()
    const pendingTasks = currentTasks.filter(t => !t.completed)
    const highPriorityTasks = pendingTasks.filter(t => t.priority === 'alta')

    // Lógica simples baseada em palavras-chave e estado das tarefas
    if (text.includes('o que devo fazer') || text.includes('por onde começar') || text.includes('próxima tarefa')) {
      if (highPriorityTasks.length > 0) {
        return `Sugiro que você comece pelas tarefas de alta prioridade. Você tem ${highPriorityTasks.length} pendente(s). A primeira da lista é: "${highPriorityTasks[0].title}".`
      } else if (pendingTasks.length > 0) {
        return `Você não tem tarefas de alta prioridade no momento. Sugiro focar em: "${pendingTasks[0].title}".`
      } else {
        return 'Sua lista está limpa! Aproveite o momento para descansar ou planejar os próximos passos.'
      }
    }

    if (text.includes('resumo') || text.includes('status') || text.includes('como estou')) {
      const completed = currentTasks.filter(t => t.completed).length
      return `Aqui está o seu resumo: Você tem ${currentTasks.length} tarefas no total, das quais ${completed} estão concluídas e ${pendingTasks.length} ainda estão pendentes. Você está indo muito bem!`
    }

    if (text.includes('sobrecarregado') || text.includes('muita coisa') || text.includes('cansado')) {
      if (pendingTasks.length > 3) {
        return `Parece que você tem muitas tarefas (${pendingTasks.length}). Respire fundo. Escolha apenas UMA tarefa fácil para começar, como "${pendingTasks.find(t => t.priority === 'baixa')?.title || pendingTasks[0].title}". Fazer algo pequeno ajuda a ganhar momento.`
      }
      return 'Foque em uma coisa de cada vez. Tente usar a técnica Pomodoro (25 minutos de foco, 5 de pausa) para não se esgotar.'
    }
    
    if (text.includes('estudos') || text.includes('estudar')) {
       const studyTasks = pendingTasks.filter(t => t.category === 'estudos')
       if (studyTasks.length > 0) {
           return `Você tem ${studyTasks.length} tarefa(s) de estudos pendente(s), como "${studyTasks[0].title}". Lembre-se de fazer pausas regulares para reter melhor a informação.`
       }
       return 'Você não tem tarefas focadas em estudos no momento. Deseja adicionar alguma?'
    }

    // Resposta padrão
    return 'Entendi. Como um assistente virtual simulado, minha capacidade é limitada no momento, mas estou aqui para te ajudar a focar. Posso te dar um resumo das tarefas ou sugerir por onde começar!'
  }

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return

    const newUserMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, newUserMessage])
    setIsTyping(true)

    // Simular delay da "IA"
    setTimeout(() => {
      const aiResponseContent = generateResponse(text, tasks)
      const newAIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, newAIMessage])
      setIsTyping(false)
    }, 1500)
  }, [tasks])

  return {
    messages,
    isTyping,
    sendMessage
  }
}
