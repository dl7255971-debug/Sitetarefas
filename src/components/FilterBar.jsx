import { FILTERS } from '../utils/constants'
import { Search, X } from 'lucide-react'

export default function FilterBar({ activeFilter, onFilterChange, search, onSearchChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Pills de filtro */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`filter-pill ${activeFilter === f.value ? 'active' : ''}`}
            onClick={() => onFilterChange(f.value)}
            aria-pressed={activeFilter === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative flex-1 sm:max-w-xs ml-auto">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="search"
          className="form-input pl-9 pr-8 py-2 text-sm"
          placeholder="Buscar tarefa..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Buscar tarefas"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
            onClick={() => onSearchChange('')}
            aria-label="Limpar busca"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
