import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { CATEGORIES, PRIORITIES, isOverdue } from '../utils/constants'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const days = []

  // dias do mês anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrev - i, current: false, date: new Date(year, month - 1, daysInPrev - i) })
  }
  // dias do mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, current: true, date: new Date(year, month, d) })
  }
  // completar grid
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, current: false, date: new Date(year, month + 1, d) })
  }
  return days
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function CalendarView({ tasks }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedDay, setSelectedDay] = useState(null)

  const { year, month } = viewDate
  const calDays = getCalendarDays(year, month)

  // Indexar tarefas por data
  const tasksByDate = {}
  tasks.forEach(t => {
    if (t.dueDate) {
      if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = []
      tasksByDate[t.dueDate].push(t)
    }
  })

  const todayKey = toDateKey(today)
  const selectedKey = selectedDay ? toDateKey(selectedDay) : null
  const selectedTasks = selectedKey ? (tasksByDate[selectedKey] || []) : []

  const prevMonth = () => setViewDate(v => {
    if (v.month === 0) return { year: v.year - 1, month: 11 }
    return { year: v.year, month: v.month - 1 }
  })

  const nextMonth = () => setViewDate(v => {
    if (v.month === 11) return { year: v.year + 1, month: 0 }
    return { year: v.year, month: v.month + 1 }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <CalendarDays size={18} className="text-amber-400" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-100">Calendário</h2>
          <p className="text-xs text-slate-500">Visualize suas tarefas por data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendário */}
        <div className="lg:col-span-2 glass-card p-5">
          {/* Navegação */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/6 text-slate-400 hover:text-slate-200 transition-all">
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-display text-lg font-semibold text-slate-100">
              {MONTHS[month]} <span className="text-amber-400">{year}</span>
            </h3>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/6 text-slate-400 hover:text-slate-200 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-1">
            {calDays.map(({ day, current, date }, idx) => {
              const key = toDateKey(date)
              const dayTasks = tasksByDate[key] || []
              const isToday = key === todayKey
              const isSelected = key === selectedKey
              const hasTasks = dayTasks.length > 0
              const hasOverdue = dayTasks.some(t => !t.completed && isOverdue(key))

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(date)}
                  className={`relative flex flex-col items-center justify-start p-1.5 rounded-xl min-h-[52px] transition-all duration-150 ${
                    !current ? 'opacity-25' : ''
                  } ${
                    isSelected
                      ? 'bg-amber-500/20 border border-amber-500/40'
                      : isToday
                      ? 'bg-amber-500/10 border border-amber-500/25'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={`text-xs font-semibold leading-none mb-1 ${
                    isToday ? 'text-amber-400' : isSelected ? 'text-amber-300' : 'text-slate-300'
                  }`}>
                    {day}
                  </span>

                  {/* Bolinhas de tarefa */}
                  {hasTasks && (
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {dayTasks.slice(0, 3).map((t, i) => {
                        const cat = CATEGORIES[t.category]
                        return (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'opacity-40' : ''}`}
                            style={{ background: cat?.hex || '#94a3b8' }}
                          />
                        )
                      })}
                      {dayTasks.length > 3 && (
                        <span className="text-[9px] text-slate-500">+{dayTasks.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Indicador overdue */}
                  {hasOverdue && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-400" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Hoje
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Tarefa
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Atrasada
            </div>
          </div>
        </div>

        {/* Painel de tarefas do dia */}
        <div className="glass-card p-5">
          {selectedDay ? (
            <>
              <h3 className="font-semibold text-slate-200 mb-1 text-sm">
                {selectedDay.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {selectedTasks.length === 0
                  ? 'Nenhuma tarefa neste dia'
                  : `${selectedTasks.length} tarefa${selectedTasks.length > 1 ? 's' : ''}`}
              </p>

              {selectedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays size={28} className="text-slate-700 mb-2" />
                  <p className="text-xs text-slate-600">Dia livre! 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTasks.map(task => {
                    const cat = CATEGORIES[task.category]
                    const pri = PRIORITIES[task.priority]
                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border border-white/6 bg-white/3 ${task.completed ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className="w-1 h-full min-h-[36px] rounded-full flex-shrink-0 mt-0.5"
                            style={{ background: cat?.hex || '#94a3b8', minHeight: 36 }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium leading-snug text-slate-200 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              <span className={`tag text-[10px] ${pri?.color}`}>{pri?.label}</span>
                              {task.completed && <span className="tag text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✓ Concluída</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <CalendarDays size={32} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-500 font-medium">Selecione um dia</p>
              <p className="text-xs text-slate-600 mt-1">Clique em qualquer data para ver as tarefas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
