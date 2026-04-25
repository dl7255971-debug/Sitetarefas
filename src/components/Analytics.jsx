import { CATEGORIES, PRIORITIES } from '../utils/constants'
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, BarChart2 } from 'lucide-react'

function ProgressRing({ percent, size = 80, stroke = 7, color = '#f59e0b' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ

  return (
    <svg width={size} height={size} className="progress-ring -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

function StatCard({ icon: Icon, label, value, sublabel, color = 'amber' }) {
  const colors = {
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    rose: 'text-rose-400 bg-rose-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
  }
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-600 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}

export default function Analytics({ stats, tasks }) {
  const categoryData = Object.entries(CATEGORIES).map(([key, cat]) => ({
    key,
    label: cat.label,
    hex: cat.hex,
    total: tasks.filter(t => t.category === key).length,
    completed: tasks.filter(t => t.category === key && t.completed).length,
  })).filter(d => d.total > 0)

  const priorityData = Object.entries(PRIORITIES).map(([key, pri]) => ({
    key,
    label: pri.label,
    hex: pri.hex,
    count: tasks.filter(t => t.priority === key && !t.completed).length,
  }))

  const maxCount = Math.max(...categoryData.map(d => d.total), 1)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <BarChart2 size={18} className="text-amber-400" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-100">Análises</h2>
          <p className="text-xs text-slate-500">Visão geral da sua produtividade</p>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total de tarefas" value={stats.total} color="blue" />
        <StatCard icon={CheckCircle2} label="Concluídas" value={stats.completed} sublabel={`${stats.completionRate}% do total`} color="emerald" />
        <StatCard icon={Clock} label="Pendentes" value={stats.pending} color="amber" />
        <StatCard icon={AlertTriangle} label="Alta prioridade" value={stats.alta} sublabel="Pendentes" color="rose" />
      </div>

      {/* Taxa de conclusão + breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Anel de progresso */}
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <ProgressRing percent={stats.completionRate} size={96} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gradient">{stats.completionRate}%</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-1">Taxa de Conclusão</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Você concluiu <span className="text-amber-400 font-semibold">{stats.completed}</span> de{' '}
              <span className="text-slate-300 font-semibold">{stats.total}</span> tarefas no total.
            </p>
            {stats.pending > 0 && (
              <p className="text-xs text-slate-600 mt-2">
                🎯 Faltam apenas <span className="text-amber-400">{stats.pending}</span> para terminar tudo!
              </p>
            )}
            {stats.pending === 0 && stats.total > 0 && (
              <p className="text-xs text-emerald-400 mt-2 font-medium">🎉 Parabéns! Tudo concluído!</p>
            )}
          </div>
        </div>

        {/* Prioridades pendentes */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4 text-sm">Pendentes por Prioridade</h3>
          <div className="space-y-3">
            {priorityData.map(({ key, label, hex, count }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-12">{label}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${stats.pending > 0 ? (count / stats.pending) * 100 : 0}%`,
                      background: hex,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-300 w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Por categoria */}
      {categoryData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-5 text-sm">Tarefas por Categoria</h3>
          <div className="space-y-4">
            {categoryData.map(({ key, label, hex, total, completed }) => {
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: hex }} />
                      <span className="text-sm text-slate-300">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{completed}/{total}</span>
                      <span className="text-xs font-semibold" style={{ color: hex }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(total / maxCount) * 100}%`,
                        background: `${hex}22`,
                      }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(completed / maxCount) * 100}%`,
                        background: hex,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {categoryData.length === 0 && (
        <div className="glass-card p-10 text-center">
          <BarChart2 size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Adicione tarefas para ver as análises aqui.</p>
        </div>
      )}
    </div>
  )
}
