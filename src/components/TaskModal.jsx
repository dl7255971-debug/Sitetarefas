import { X, Plus, CalendarDays, Tag, Flag, FileText } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, PRIORITIES } from '../utils/constants'

const EMPTY_FORM = {
  title: '',
  category: 'trabalho',
  priority: 'média',
  dueDate: '',
}

export default function TaskModal({ onClose, onSave, editTask = null }) {
  const [form, setForm] = useState(editTask ? {
    title: editTask.title,
    category: editTask.category,
    priority: editTask.priority,
    dueDate: editTask.dueDate || '',
  } : EMPTY_FORM)

  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'O título é obrigatório'
    if (form.title.trim().length > 120) e.title = 'Máximo de 120 caracteres'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ ...form, title: form.title.trim() })
    onClose()
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={editTask ? 'Editar tarefa' : 'Nova tarefa'}
    >
      <div className="glass-card w-full max-w-lg animate-scale-in" style={{ background: 'rgba(20,23,32,0.97)' }}>
        {/* Header do modal */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-100">
              {editTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {editTask ? 'Atualize os dados da tarefa' : 'Adicione uma nova tarefa à sua lista'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/6 transition-all"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Linha decorativa */}
        <div className="mx-6 mt-4 h-px bg-gradient-to-r from-amber-500/30 via-amber-500/10 to-transparent" />

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <FileText size={12} />
              Título da Tarefa
            </label>
            <input
              ref={titleRef}
              type="text"
              className={`form-input ${errors.title ? 'border-rose-500/60 focus:border-rose-500' : ''}`}
              placeholder="Ex: Revisar proposta do cliente..."
              value={form.title}
              onChange={(e) => { setForm(f => ({ ...f, title: e.target.value })); setErrors(e => ({ ...e, title: '' })) }}
              maxLength={120}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.title
                ? <p className="text-xs text-rose-400">{errors.title}</p>
                : <span />
              }
              <span className={`text-[11px] ml-auto ${form.title.length > 100 ? 'text-amber-400' : 'text-slate-600'}`}>
                {form.title.length}/120
              </span>
            </div>
          </div>

          {/* Linha: Categoria + Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Tag size={12} />
                Categoria
              </label>
              <div className="relative">
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {Object.entries(CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Flag size={12} />
                Prioridade
              </label>
              <div className="relative">
                <select
                  className="form-select"
                  value={form.priority}
                  onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                >
                  {Object.entries(PRIORITIES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Data de vencimento */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <CalendarDays size={12} />
              Data de Conclusão
            </label>
            <input
              type="date"
              className="form-input"
              min={today}
              value={form.dueDate}
              onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Preview das tags selecionadas */}
          <div className="flex items-center gap-2 py-3 px-4 bg-white/3 rounded-xl border border-white/5">
            <span className="text-xs text-slate-500 mr-1">Preview:</span>
            <span className={`tag ${CATEGORIES[form.category]?.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${CATEGORIES[form.category]?.dot} inline-block`} />
              {CATEGORIES[form.category]?.label}
            </span>
            <span className={`tag ${PRIORITIES[form.priority]?.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITIES[form.priority]?.dot} inline-block`} />
              {PRIORITIES[form.priority]?.label}
            </span>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Plus size={16} />
              {editTask ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
