import { useState, useMemo } from 'react'
import Navbar from './components/Navbar'
import TaskCard from './components/TaskCard'
import TaskModal from './components/TaskModal'
import FilterBar from './components/FilterBar'
import Analytics from './components/Analytics'
import CalendarView from './components/CalendarView'
import Login from './components/Login'
import { useTasks } from './hooks/useTasks'
import { useAuth } from './hooks/useAuth'
import { PRIORITIES } from './utils/constants'
import { Plus, CheckSquare2, Sparkles, Trash2, Loader2 } from 'lucide-react'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <MainApp />
}

function MainApp() {
  const { tasks, addTask, toggleTask, deleteTask, clearCompleted, stats } = useTasks()
  const [activePage, setActivePage] = useState('tarefas')
  const [activeFilter, setActiveFilter] = useState('todas')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  // Filtrar e ordenar tarefas
  const filteredTasks = useMemo(() => {
    let list = tasks

    // Filtro por status
    if (activeFilter === 'pendentes') list = list.filter(t => !t.completed)
    if (activeFilter === 'concluídas') list = list.filter(t => t.completed)

    // Filtro por busca
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    }

    // Ordenar: incompletas por prioridade → completas por último
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const pa = PRIORITIES[a.priority]?.order ?? 99
      const pb = PRIORITIES[b.priority]?.order ?? 99
      return pa - pb
    })
  }, [tasks, activeFilter, search])

  const hasCompleted = tasks.some(t => t.completed)

  return (
    <div className="min-h-screen bg-surface-900 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow w-[600px] h-[600px] top-[-200px] left-[-100px] opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
      <div className="ambient-glow w-[500px] h-[500px] top-[30%] right-[-150px] opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      <div className="ambient-glow w-[400px] h-[400px] bottom-0 left-[30%] opacity-[0.035]"
        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />

      {/* Navbar */}
      <Navbar activePage={activePage} onPageChange={setActivePage} stats={stats} />

      {/* Conteúdo principal */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* === PÁGINA: TAREFAS === */}
        {activePage === 'tarefas' && (
          <div className="space-y-6 animate-fade-in">
            {/* Hero header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-xs text-amber-400 font-medium tracking-wider uppercase">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-100 leading-tight">
                  Minhas{' '}
                  <span className="text-gradient">Tarefas</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1.5">
                  {stats.pending === 0 && stats.total > 0
                    ? '🎉 Todas as tarefas concluídas!'
                    : `${stats.pending} pendente${stats.pending !== 1 ? 's' : ''} · ${stats.completed} concluída${stats.completed !== 1 ? 's' : ''}`
                  }
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {hasCompleted && (
                  <button
                    className="btn-ghost flex items-center gap-2 text-xs"
                    onClick={clearCompleted}
                    title="Limpar concluídas"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Limpar concluídas</span>
                  </button>
                )}
                <button
                  id="btn-nova-tarefa"
                  className="btn-primary flex items-center gap-2"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Nova Tarefa
                </button>
              </div>
            </div>

            {/* Barra de métricas rápidas */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: stats.total, color: 'text-slate-300' },
                { label: 'Pendentes', value: stats.pending, color: 'text-amber-400' },
                { label: 'Concluídas', value: stats.completed, color: 'text-emerald-400' },
              ].map(m => (
                <div key={m.label} className="glass-card p-3 sm:p-4 text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Filtros e busca */}
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              search={search}
              onSearchChange={setSearch}
            />

            {/* Lista de tarefas */}
            {filteredTasks.length === 0 ? (
              <EmptyState
                filter={activeFilter}
                search={search}
                onAdd={() => setShowModal(true)}
              />
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}

                {/* Contador de resultados */}
                <p className="text-center text-xs text-slate-600 pt-2">
                  Exibindo {filteredTasks.length} de {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {/* === PÁGINA: ANÁLISES === */}
        {activePage === 'analises' && (
          <Analytics stats={stats} tasks={tasks} />
        )}

        {/* === PÁGINA: CALENDÁRIO === */}
        {activePage === 'calendario' && (
          <CalendarView tasks={tasks} />
        )}
      </main>

      {/* Modal de nova tarefa */}
      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onSave={addTask}
        />
      )}
    </div>
  )
}

function EmptyState({ filter, search, onAdd }) {
  const isSearch = search.trim().length > 0

  return (
    <div className="glass-card p-12 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
        <CheckSquare2 size={28} className="text-amber-400/60" />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-300 mb-2">
        {isSearch
          ? 'Nenhum resultado encontrado'
          : filter === 'concluídas'
          ? 'Nenhuma tarefa concluída'
          : filter === 'pendentes'
          ? 'Nenhuma tarefa pendente'
          : 'Sua lista está vazia'
        }
      </h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
        {isSearch
          ? `Não encontramos tarefas com "${search}".`
          : filter === 'todas'
          ? 'Comece adicionando sua primeira tarefa e organize seu dia com estilo.'
          : 'Nenhuma tarefa nesta categoria no momento.'
        }
      </p>
      {(filter === 'todas' || filter === 'pendentes') && !isSearch && (
        <button className="btn-primary inline-flex items-center gap-2" onClick={onAdd}>
          <Plus size={16} />
          Adicionar primeira tarefa
        </button>
      )}
    </div>
  )
}
