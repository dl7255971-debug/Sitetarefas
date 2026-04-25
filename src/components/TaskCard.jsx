import { CalendarDays, Trash2, AlertCircle } from 'lucide-react'
import { CATEGORIES, PRIORITIES, formatDate, isOverdue, isDueToday } from '../utils/constants'

export default function TaskCard({ task, onToggle, onDelete }) {
  const category = CATEGORIES[task.category] || CATEGORIES.pessoal
  const priority = PRIORITIES[task.priority] || PRIORITIES.baixa
  const overdue = !task.completed && isOverdue(task.dueDate)
  const today = !task.completed && isDueToday(task.dueDate)

  return (
    <div
      className={`glass-card-hover p-4 sm:p-5 flex items-start gap-4 group task-enter ${
        task.completed ? 'task-done opacity-60' : ''
      } ${overdue ? 'border-rose-500/30' : ''}`}
    >
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
  )
}
