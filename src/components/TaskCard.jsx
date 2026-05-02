import { CalendarDays, Trash2, AlertCircle, ChevronDown, ChevronUp, FileText, Paperclip, CheckSquare, Repeat, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES, PRIORITIES, formatDate, isOverdue, isDueToday } from '../utils/constants'

export default function TaskCard({ task, onToggle, onToggleSubtask, onDelete, onRestore }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const category = CATEGORIES[task.category] || CATEGORIES.pessoal
  const priority = PRIORITIES[task.priority] || PRIORITIES.baixa
  const overdue = !task.completed && isOverdue(task.dueDate)
  const today = !task.completed && isDueToday(task.dueDate)

  const subtasks = task.subtasks || []
  const hasSubtasks = subtasks.length > 0
  const completedSubtasks = subtasks.filter(st => st.completed).length
  const progressPercent = hasSubtasks ? Math.round((completedSubtasks / subtasks.length) * 100) : 0
  
  const attachments = task.attachments || []
  const hasDescription = !!task.description
  const hasAttachments = attachments.length > 0
  const recurrence = task.recurrence || { type: 'none' }
  const hasExtraContent = hasSubtasks || hasDescription || hasAttachments

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
          
          {recurrence.type !== 'none' && (
            <span className="tag bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Repeat size={10} />
              Recorrente
            </span>
          )}
        </div>

        {/* Título */}
        <h3 className={`task-title font-medium text-slate-100 text-[0.92rem] leading-snug mb-2 ${
          task.completed ? 'line-through text-slate-500' : ''
        }`}>
          {task.title}
        </h3>

        {/* Data de vencimento e Hora */}
        {(task.dueDate || task.due_time) && (
          <div className={`flex items-center gap-1.5 text-xs ${
            overdue ? 'text-rose-400' : 'text-slate-500'
          }`}>
            <CalendarDays size={12} />
            <span>{task.dueDate ? formatDate(task.dueDate) : 'Sem data'}</span>
            {task.due_time && (
              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold ml-1 border border-white/5">
                {task.due_time.substring(0, 5)}
              </span>
            )}
          </div>
        )}

        {/* Horário de criação */}
        {task.createdAt && (
          <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-1 italic">
            <span>Criada às {new Date(task.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
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
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        {/* Botão Restaurar (apenas se arquivada) */}
        {task.archived && onRestore && (
          <button
            onClick={() => onRestore(task.id)}
            className="flex-shrink-0 p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all duration-200"
            title="Restaurar para Minhas Tarefas"
          >
            <RotateCcw size={15} />
          </button>
        )}

        {/* Botão deletar */}
        <button
          onClick={() => {
            if (window.confirm('Tem certeza que deseja excluir essa tarefa?')) {
              onDelete(task.id)
            }
          }}
          className="flex-shrink-0 p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={`Excluir tarefa "${task.title}"`}
          title="Excluir tarefa permanentemente"
        >
          <Trash2 size={15} />
        </button>

        {/* Toggle Button */}
        {hasExtraContent && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className={`p-1.5 rounded-md transition-all ${isExpanded ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10'}`}
            aria-label={isExpanded ? "Esconder detalhes" : "Ver detalhes"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      </div>

      {/* Área Expandida */}
      {hasExtraContent && isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/5 pl-[2.25rem] pr-2 space-y-5 animate-fade-in">
          
          {/* Descrição */}
          {hasDescription && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText size={11} className="text-cyan-500/60" /> Descrição
              </p>
              <p className="text-[0.85rem] text-slate-400 leading-relaxed whitespace-pre-wrap pl-1">
                {task.description}
              </p>
            </div>
          )}

          {/* Anexos */}
          {hasAttachments && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Paperclip size={11} className="text-cyan-500/60" /> Anexos ({attachments.length})
              </p>
              <div className="flex flex-wrap gap-3 pl-1">
                {attachments.map((file, idx) => (
                  <a 
                    key={idx} 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/3 border border-white/5 hover:bg-white/6 hover:border-cyan-500/30 rounded-xl p-2.5 transition-all group/file"
                  >
                    {file.type?.startsWith('image/') ? (
                      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover/file:border-cyan-500/40">
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10 group-hover/file:border-cyan-500/40">
                        <FileText size={20} className="text-slate-500" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-slate-200 font-medium truncate max-w-[140px]">{file.name}</span>
                      <span className="text-[10px] text-slate-500 group-hover/file:text-cyan-400/70 transition-colors italic">Clique para abrir</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Subtarefas */}
          {hasSubtasks && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <CheckSquare size={11} className="text-cyan-500/60" /> Etapas do Projeto
              </p>
              <div className="space-y-2.5 pl-1">
                {subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-3 group/st">
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
