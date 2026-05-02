import { CalendarDays, Trash2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES, PRIORITIES, formatDate, isOverdue, isDueToday } from '../utils/constants'

export default function TaskCard({ task, onToggle, onToggleSubtask, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const category = CATEGORIES[task.category] || CATEGORIES.pessoal
  const priority = PRIORITIES[task.priority] || PRIORITIES.baixa
  const overdue = !task.completed && isOverdue(task.dueDate)
  const today = !task.completed && isDueToday(task.dueDate)

  const subtasks = task.subtasks || []
  const hasSubtasks = subtasks.length > 0
  const completedSubtasks = subtasks.filter(st => st.completed).length
  const progressPercent = hasSubtasks ? Math.round((completedSubtasks / subtasks.length) * 100) : 0

  return (
    <div
      className={`glass-card-hover p-4 sm:p-5 flex flex-col group task-enter ${
        task.completed ? 'task-done opacity-60' : ''
      } ${overdue ? 'border-rose-500/30' : ''}`}
    >
      <div className="flex items-start gap-4">
      {/* Checkbox */}
      <div className="mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          className="custom-checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Marcar "${task.title}" como ${task.completed ? 'pendente' : 'concluída'}`}
        />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {/* Tag de categoria */}
          <span className={`tag ${category.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${category.dot} inline-block`} />
            {category.label}
          </span>

          {/* Tag de prioridade */}
          <span className={`tag ${priority.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot} inline-block`} />
            {priority.label}
          </span>

          {/* Badge de overdue/hoje */}
          {overdue && (
            <span className="tag bg-rose-900/40 text-rose-300 border border-rose-500/40">
              <AlertCircle size={10} />
              Atrasado
            </span>
          )}
          {today && !overdue && (
            <span className="tag bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Hoje
            </span>
          )}
        </div>

        {/* Título */}
        <h3 className={`task-title font-medium text-slate-100 text-[0.92rem] leading-snug mb-2 ${
          task.completed ? 'line-through text-slate-500' : ''
        }`}>
          {task.title}
        </h3>

        {/* Data de vencimento */}
        {task.dueDate && (
          <div className={`flex items-center gap-1.5 text-xs ${
            overdue ? 'text-rose-400' : 'text-slate-500'
          }`}>
            <CalendarDays size={12} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}

        {/* Progresso de Subtarefas */}
        {hasSubtasks && (
          <div className="mt-3.5 flex items-center gap-3">
            <div className="flex-1 max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${task.completed ? 'bg-emerald-500' : 'bg-cyan-400'}`} 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              {completedSubtasks}/{subtasks.length} Etapas
            </span>
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="ml-auto text-slate-500 hover:text-cyan-400 transition-colors p-1 rounded-md hover:bg-cyan-500/10"
              aria-label={isExpanded ? "Esconder etapas" : "Ver etapas"}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Botão deletar */}
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 mt-0.5 p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={`Excluir tarefa "${task.title}"`}
        title="Excluir tarefa"
      >
        <Trash2 size={15} />
      </button>
      </div>

      {/* Área Expandida para Subtarefas */}
      {hasSubtasks && isExpanded && (
        <div className="mt-4 pt-3 border-t border-white/5 pl-[2.25rem] pr-2 space-y-2 animate-fade-in">
          {subtasks.map(st => (
            <div key={st.id} className="flex items-center gap-2.5 group/st">
              <input 
                type="checkbox" 
                className="custom-checkbox scale-75 cursor-pointer" 
                checked={st.completed}
                onChange={() => onToggleSubtask(task.id, st.id)}
              />
              <span className={`text-[0.85rem] flex-1 transition-colors ${st.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                {st.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
