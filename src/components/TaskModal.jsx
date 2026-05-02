import { X, Plus, CalendarDays, Tag, Flag, FileText, CheckSquare, Trash2, Paperclip, Image, Repeat, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, PRIORITIES } from '../utils/constants'
import { supabase } from '../utils/supabase'

const EMPTY_FORM = {
  title: '',
  category: 'trabalho',
  priority: 'média',
  dueDate: '',
  dueTime: '',
  subtasks: [],
  description: '',
  recurrence: { type: 'none' },
  attachments: []
}

export default function TaskModal({ onClose, onSave, editTask = null }) {
  const [form, setForm] = useState(editTask ? {
    title: editTask.title,
    category: editTask.category,
    priority: editTask.priority,
    dueDate: editTask.dueDate || '',
    dueTime: editTask.due_time || '',
    subtasks: editTask.subtasks || [],
    description: editTask.description || '',
    recurrence: editTask.recurrence || { type: 'none' },
    attachments: editTask.attachments || []
  } : EMPTY_FORM)

  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const titleRef = useRef(null)
  const fileInputRef = useRef(null)

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
    // Validar subtarefas vazias (opcional: remover subtarefas vazias antes de salvar)
    const cleanedSubtasks = form.subtasks.filter(st => st.title.trim() !== '')
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ ...form, title: form.title.trim(), subtasks: cleanedSubtasks })
    onClose()
  }

  const addSubtask = () => {
    setForm(f => ({
      ...f,
      subtasks: [...f.subtasks, { id: crypto.randomUUID(), title: '', completed: false }]
    }))
  }

  const removeSubtask = (id) => {
    setForm(f => ({
      ...f,
      subtasks: f.subtasks.filter(st => st.id !== id)
    }))
  }

  const updateSubtaskTitle = (id, title) => {
    setForm(f => ({
      ...f,
      subtasks: f.subtasks.map(st => st.id === id ? { ...st, title } : st)
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath)

      setForm(f => ({
        ...f,
        attachments: [...f.attachments, { name: file.name, url: publicUrl, type: file.type }]
      }))
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeAttachment = (index) => {
    setForm(f => ({
      ...f,
      attachments: f.attachments.filter((_, i) => i !== index)
    }))
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
      <div className="glass-card w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar" style={{ background: 'rgba(20,23,32,0.97)' }}>
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

          {/* NOVO: Descrição e Anexos no TOPO para maior visibilidade */}
          <div className="grid grid-cols-1 gap-5 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
            {/* Descrição detalhada */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                <FileText size={12} />
                Descrição Detalhada
              </label>
              <textarea
                className="form-input min-h-[80px] py-3 resize-none bg-black/20"
                placeholder="Adicione mais detalhes sobre esta tarefa..."
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Anexos e Fotos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Paperclip size={12} />
                  Anexos e Fotos
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs flex items-center gap-1.5 text-amber-900 bg-amber-400 hover:bg-amber-300 transition-all px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  ADICIONAR FOTO
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                />
              </div>

              {form.attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2 animate-fade-in group/file">
                      {file.type.startsWith('image/') ? (
                        <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                          <img src={file.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center border border-white/10">
                          <FileText size={16} className="text-slate-400" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-300 max-w-[100px] truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-[9px] text-rose-400 hover:underline text-left"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 italic">Nenhuma imagem anexada ainda.</p>
              )}
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

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <CalendarDays size={12} />
                Data
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

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <CalendarDays size={12} className="text-amber-500/60" />
                Horário
              </label>
              <input
                type="time"
                className="form-input"
                value={form.dueTime}
                onChange={(e) => setForm(f => ({ ...f, dueTime: e.target.value }))}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Recorrência */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Repeat size={12} />
              Repetir Tarefa
            </label>
            <div className="relative">
              <select
                className="form-select"
                value={form.recurrence.type}
                onChange={(e) => setForm(f => ({ ...f, recurrence: { ...f.recurrence, type: e.target.value } }))}
              >
                <option value="none">Não repetir</option>
                <option value="daily">Todo dia</option>
                <option value="weekly">Toda semana</option>
                <option value="monthly">Todo mês</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>



          {/* Subtarefas */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <CheckSquare size={12} />
                Etapas do Projeto
              </label>
              <button
                type="button"
                onClick={addSubtask}
                className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded-md"
              >
                <Plus size={12} /> Adicionar Etapa
              </button>
            </div>
            
            {form.subtasks.length > 0 ? (
              <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                {form.subtasks.map((st, index) => (
                  <div key={st.id} className="flex items-center gap-2 animate-fade-in group">
                    <span className="text-xs font-medium text-slate-500 w-4 text-center">{index + 1}.</span>
                    <input
                      type="text"
                      className="form-input py-1.5 text-sm flex-1 bg-white/[0.02]"
                      placeholder="Descrição da etapa..."
                      value={st.title}
                      onChange={(e) => updateSubtaskTitle(st.id, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeSubtask(st.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remover etapa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/5">
                Nenhuma etapa. Divida sua tarefa em partes menores!
              </div>
            )}
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
