import { useEffect, useCallback } from 'react'
import { isDueToday, isOverdue } from '../utils/constants'

export function useNotifications(tasks, profile) {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações de desktop.')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      console.log('Permissão de notificação solicitada:', permission)
      return permission === 'granted'
    }

    return false
  }, [])

  const sendNotification = useCallback((title, options = {}) => {
    if (!('Notification' in window)) {
      console.warn('Notificações não suportadas neste navegador.')
      return
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notificações bloqueadas pelo navegador ou permissão não solicitada.')
      return
    }
    
    // Check if user enabled push notifications in their profile
    // We only skip if force is NOT true AND notify_push is explicitly false
    if (!options.force && profile && profile.notify_push === false) {
      console.log('Notificação ignorada: usuário desativou notificações push no perfil.')
      return
    }

    console.log('Enviando notificação:', title, options)
    try {
      new Notification(title, {
        icon: '/vite.svg',
        ...options
      })
    } catch (err) {
      console.error('Erro ao criar notificação:', err)
    }
  }, [profile])

  // Check for tasks due today on mount/change
  useEffect(() => {
    if (!profile) return 
    
    // Only run if user wants notifications and granted permissions
    if (profile.notify_push === false) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const now = new Date()
    const lastNotifiedDate = sessionStorage.getItem('last_notified_date')
    const todayStr = now.toDateString()

    if (lastNotifiedDate !== todayStr && tasks && tasks.length > 0) {
      const dueToday = tasks.filter(t => !t.completed && !t.archived && isDueToday(t.dueDate))
      const overdue = tasks.filter(t => !t.completed && !t.archived && isOverdue(t.dueDate))

      if (dueToday.length > 0 || overdue.length > 0) {
        let msg = ''
        if (dueToday.length > 0) msg += `Você tem ${dueToday.length} tarefa(s) para hoje. `
        if (overdue.length > 0) msg += `E ${overdue.length} tarefa(s) atrasada(s)!`

        sendNotification('Resumo Diário de Tarefas', {
          body: msg,
          tag: 'daily-summary'
        })

        sessionStorage.setItem('last_notified_date', todayStr)
      }
    }
  }, [tasks, profile, sendNotification])

  return { requestPermission, sendNotification }
}
