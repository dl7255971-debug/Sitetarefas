import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { addDays, addWeeks, addMonths, format } from 'date-fns'

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
          completed: false,
          subtasks: taskData.subtasks || [],
          description: taskData.description || '',
          attachments: taskData.attachments || [],
          recurrence: taskData.recurrence || null,
          archived: false
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
    
    // Auto-complete subtasks if main task is completed
    const updatedSubtasks = task.subtasks ? task.subtasks.map(st => ({ ...st, completed: newStatus })) : []

    // Recurrence Logic
    let recurrenceTaskToCreate = null;
    if (newStatus && task.recurrence && task.recurrence.type !== 'none') {
      let nextDate = new Date(task.dueDate ? task.dueDate + 'T12:00:00' : new Date());
      if (task.recurrence.type === 'daily') nextDate = addDays(nextDate, 1);
      else if (task.recurrence.type === 'weekly') nextDate = addWeeks(nextDate, 1);
      else if (task.recurrence.type === 'monthly') nextDate = addMonths(nextDate, 1);
      
      recurrenceTaskToCreate = {
        ...task,
        id: crypto.randomUUID(), // optimistic ID
        completed: false,
        dueDate: format(nextDate, 'yyyy-MM-dd'),
        subtasks: task.subtasks ? task.subtasks.map(st => ({...st, completed: false})) : [],
        createdAt: new Date().toISOString()
      };
    }

    // Optimistic update
    setTasks(prev => {
      let newList = prev.map(t =>
        t.id === id ? { ...t, completed: newStatus, subtasks: updatedSubtasks } : t
      )
      if (recurrenceTaskToCreate) {
        newList = [recurrenceTaskToCreate, ...newList]
      }
      return newList
    })

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newStatus, subtasks: updatedSubtasks })
        .eq('id', id)

      if (error) throw error

      if (recurrenceTaskToCreate) {
        const { id: optId, ...rest } = recurrenceTaskToCreate;
        const { data: recData, error: recError } = await supabase.from('tasks').insert([{
          title: rest.title,
          category: rest.category,
          priority: rest.priority,
          dueDate: rest.dueDate,
          completed: false,
          subtasks: rest.subtasks,
          description: rest.description,
          attachments: rest.attachments,
          recurrence: rest.recurrence
        }]).select()
        
        if (!recError && recData && recData.length > 0) {
          setTasks(prev => prev.map(t => t.id === optId ? recData[0] : t))
        }
      }
    } catch (error) {
      console.error('Erro ao alternar status da tarefa:', error)
      fetchTasks() // revert on error
    }
  }, [tasks])

  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || !task.subtasks) return

    const newSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )

    const allSubtasksCompleted = newSubtasks.length > 0 && newSubtasks.every(st => st.completed)
    // If all subtasks are completed, also complete the main task. If main task was completed but a subtask is unchecked, uncheck the main task.
    const newTaskCompleted = allSubtasksCompleted ? true : (task.completed && !allSubtasksCompleted ? false : task.completed)

    // Optimistic
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, subtasks: newSubtasks, completed: newTaskCompleted } : t
    ))

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ subtasks: newSubtasks, completed: newTaskCompleted })
        .eq('id', taskId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao alternar subtarefa:', error)
      fetchTasks()
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
    setTasks(prev => prev.map(t => t.completed && !t.archived ? { ...t, archived: true } : t))

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ archived: true })
        .eq('completed', true)
        .eq('archived', false)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao arquivar tarefas concluídas:', error)
      fetchTasks()
    }
  }, [])

  const activeTasks = tasks.filter(t => !t.archived)
  
  const stats = {
    total: activeTasks.length,
    completed: activeTasks.filter(t => t.completed).length,
    pending: activeTasks.filter(t => !t.completed).length,
    alta: activeTasks.filter(t => t.priority === 'alta' && !t.completed).length,
    byCategory: {
      trabalho: activeTasks.filter(t => t.category === 'trabalho').length,
      pessoal: activeTasks.filter(t => t.category === 'pessoal').length,
      estudos: activeTasks.filter(t => t.category === 'estudos').length,
      saúde: activeTasks.filter(t => t.category === 'saúde').length,
      financeiro: activeTasks.filter(t => t.category === 'financeiro').length,
    },
    completionRate: activeTasks.length > 0
      ? Math.round((activeTasks.filter(t => t.completed).length / activeTasks.length) * 100)
      : 0,
  }

  return { tasks, addTask, updateTask, toggleTask, toggleSubtask, deleteTask, clearCompleted, stats }
}

