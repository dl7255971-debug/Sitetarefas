// Configurações de categorias e prioridades
export const CATEGORIES = {
  trabalho: {
    label: 'Trabalho',
    color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    dot: 'bg-blue-400',
    hex: '#60a5fa',
  },
  pessoal: {
    label: 'Pessoal',
    color: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    dot: 'bg-violet-400',
    hex: '#a78bfa',
  },
  estudos: {
    label: 'Estudos',
    color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    dot: 'bg-emerald-400',
    hex: '#34d399',
  },
  saúde: {
    label: 'Saúde',
    color: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    dot: 'bg-rose-400',
    hex: '#fb7185',
  },
  financeiro: {
    label: 'Financeiro',
    color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    dot: 'bg-amber-400',
    hex: '#fbbf24',
  },
}

export const PRIORITIES = {
  alta: {
    label: 'Alta',
    color: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    dot: 'bg-rose-400',
    hex: '#f43f5e',
    order: 1,
  },
  média: {
    label: 'Média',
    color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    dot: 'bg-orange-400',
    hex: '#fb923c',
    order: 2,
  },
  baixa: {
    label: 'Baixa',
    color: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    dot: 'bg-teal-400',
    hex: '#2dd4bf',
    order: 3,
  },
}

export const FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendentes', label: 'Pendentes' },
  { value: 'concluídas', label: 'Concluídas' },
]

export function formatDate(dateStr) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function isOverdue(dateStr) {
  if (!dateStr) return false
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function isDueToday(dateStr) {
  if (!dateStr) return false
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}
