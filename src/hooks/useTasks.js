import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useTasks() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('createdAt', { ascending: false })
      
      if (error) throw error
      if (data) setTasks(data)
    } catch (error) {
      console.error('Erro ao carregar tarefas do Supabase:', error)
    }
  }

  const addTask = useCallback(async (taskData) => {
    // Generate an optimistic ID or wait for response, we will wait for response but also we can just insert and refresh.
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          category: taskData.category,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          completed: false
        }])
        .select()

      if (error) throw error
      if (data && data.length > 0) {
        setTasks(prev => [data[0], ...prev])
        return data[0]
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
    }
  }, [])

  const updateTask = useCallback(async (id, updates) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      fetchTasks() // revert on error
    }
  }, [])

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    
    const newStatus = !task.completed
    
    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: newStatus } : t
    ))

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newStatus })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao alternar status da tarefa:', error)
      fetchTasks() // revert on error
    }
  }, [tasks])

  const deleteTask = useCallback(async (id) => {
    // Optimistic delete
    setTasks(prev => prev.filter(t => t.id !== id))

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
      fetchTasks() // revert
    }
  }, [])

  const clearCompleted = useCallback(async () => {
    // Optimistic
    setTasks(prev => prev.filter(t => !t.completed))

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('completed', true)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao limpar tarefas concluídas:', error)
      fetchTasks()
    }
  }, [])

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    alta: tasks.filter(t => t.priority === 'alta' && !t.completed).length,
    byCategory: {
      trabalho: tasks.filter(t => t.category === 'trabalho').length,
      pessoal: tasks.filter(t => t.category === 'pessoal').length,
      estudos: tasks.filter(t => t.category === 'estudos').length,
      saúde: tasks.filter(t => t.category === 'saúde').length,
      financeiro: tasks.filter(t => t.category === 'financeiro').length,
    },
    completionRate: tasks.length > 0
      ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
      : 0,
  }

  return { tasks, addTask, updateTask, toggleTask, deleteTask, clearCompleted, stats }
}

