import { CheckSquare, BarChart2, Calendar, LogOut, Menu, X, User, Bot, Archive } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

const NAV_ITEMS = [
  { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
  { id: 'arquivo', label: 'Arquivo', icon: Archive },
  { id: 'analises', label: 'Análises', icon: BarChart2 },
  { id: 'calendario', label: 'Calendário', icon: Calendar },
  { id: 'assistente', label: 'Assistente', icon: Bot },
]

export default function Navbar({ activePage, onPageChange, stats }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { signOut } = useAuth()
  const { profile } = useProfile()

  return (
    <header className="sticky top-0 z-40">
      {/* Glow superior */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <nav
        className="glass-card rounded-none border-x-0 border-t-0 px-4 sm:px-6"
        style={{ borderRadius: 0, backdropFilter: 'blur(24px)', background: 'rgba(13,15,20,0.85)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <CheckSquare size={16} className="text-stone-900" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-lg text-gradient tracking-tight">
                TaskFlow
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                Organize · Foque · Conquiste
              </span>
            </div>
          </div>

          {/* Nav central — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onPageChange(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  activePage === id
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon size={15} strokeWidth={activePage === id ? 2.5 : 2} />
                {label}
                {activePage === id && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Lado direito */}
          <div className="flex items-center gap-3">
            {/* Stats badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs bg-white/5 border border-white/8 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-slate-400">
                <span className="text-amber-400 font-semibold">{stats.pending}</span> pendente{stats.pending !== 1 ? 's' : ''}
              </span>
            </div>
            {/* Perfil Badge / Avatar */}
            <button
              onClick={() => onPageChange('perfil')}
              className={`hidden md:flex items-center gap-2 pr-3 pl-1 py-1 rounded-full text-sm font-medium transition-all duration-200 border ${
                activePage === 'perfil' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10'
              }`}
              title="Meu Perfil"
            >
              <div className="w-7 h-7 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={14} className="text-slate-400" />
                )}
              </div>
              <span className="max-w-[100px] truncate">
                {profile?.username || 'Perfil'}
              </span>
            </button>

            {/* Botão Sair */}
            <button
              onClick={signOut}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 border border-transparent hover:border-rose-500/20"
              title="Sair"
            >
              <LogOut size={15} />
              <span className="text-xs">Sair</span>
            </button>

            {/* Hamburger mobile */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/6 py-3 space-y-1 animate-slide-in">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { onPageChange(id); setMenuOpen(false) }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activePage === id
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
            <div className="pt-2 border-t border-white/6">
              <button 
                onClick={() => { onPageChange('perfil'); setMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activePage === 'perfil'
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <User size={16} />
                Meu Perfil
              </button>
              <button 
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
