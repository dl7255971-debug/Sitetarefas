import { useState, useRef } from 'react'
import { User, Mail, Lock, Camera, Loader2, Save, Check, Bell, BellRing } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

export default function Profile() {
  const { user } = useAuth()
  const { profile, loading, updateUsername, uploadAvatar, updatePassword, updatePreferences } = useProfile()
  
  const [username, setUsername] = useState(profile?.username || '')
  const [password, setPassword] = useState('')
  const [prefs, setPrefs] = useState({
    notify_email: profile?.notify_email ?? false,
    notify_push: profile?.notify_push ?? true
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const fileInputRef = useRef(null)

  // Sincronizar state inicial quando profile carregar
  useEffect(() => {
    if (profile) {
      if (username === '') setUsername(profile.username || '')
      setPrefs({
        notify_email: profile.notify_email,
        notify_push: profile.notify_push
      })
    }
  }, [profile])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUpdating(true)
    setMessage({ text: '', type: '' })
    
    const { error } = await uploadAvatar(file)
    
    if (error) {
      setMessage({ text: 'Erro ao enviar foto.', type: 'error' })
    } else {
      setMessage({ text: 'Foto atualizada com sucesso!', type: 'success' })
    }
    setIsUpdating(false)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage({ text: '', type: '' })

    let hasError = false
    
    if (username !== profile?.username) {
      const { error } = await updateUsername(username)
      if (error) {
        hasError = true
        setMessage({ text: 'Erro ao atualizar o nome de usuário.', type: 'error' })
      }
    }

      }
    }

    // Atualizar preferências
    const { error: prefError } = await updatePreferences(prefs)
    if (prefError) {
      hasError = true
      setMessage({ text: 'Erro ao atualizar preferências.', type: 'error' })
    }

    if (!hasError) {
      setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' })
    }
    
    setIsUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-100">
          Meu <span className="text-gradient">Perfil</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Gerencie suas informações pessoais e configurações de conta.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8 pb-8 border-b border-white/5">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-24 h-24 rounded-full bg-surface-800 border-2 border-amber-500/30 flex items-center justify-center overflow-hidden shadow-xl shadow-amber-500/10 transition-transform group-hover:scale-105">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-slate-500" />
              )}
            </div>
            
            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white mb-1" />
              <span className="text-[10px] text-white font-medium uppercase tracking-wider">Alterar</span>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-200">
            {profile?.username || 'Usuário TaskFlow'}
          </h3>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <Mail size={14} />
            {user?.email}
          </p>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm border ${
            message.type === 'error' 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {message.type === 'success' ? <Check size={18} /> : null}
            {message.text}
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="username">
              Nome de Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User size={18} className="text-slate-500" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-800/50 border border-surface-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                placeholder="Como quer ser chamado?"
              />
            </div>
          </div>

            <p className="mt-1.5 text-xs text-slate-500">Mínimo de 6 caracteres.</p>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Bell size={16} className="text-amber-500/70" />
              Preferências de Notificação
            </h4>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 bg-surface-800/30 border border-surface-700 rounded-xl cursor-pointer hover:bg-surface-800/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Notificações Push</p>
                    <p className="text-xs text-slate-500">Receber alertas no navegador</p>
                  </div>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-surface-600">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={prefs.notify_push}
                    onChange={(e) => setPrefs(prev => ({ ...prev, notify_push: e.target.checked }))}
                  />
                  <div className={`h-5 w-5 rounded-full bg-white shadow transform transition-transform peer-checked:translate-x-5 ${prefs.notify_push ? 'bg-amber-500 !translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>

              <label className="flex items-center justify-between p-3.5 bg-surface-800/30 border border-surface-700 rounded-xl cursor-pointer hover:bg-surface-800/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400 group-hover:bg-slate-500/20 transition-colors">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Notificações por E-mail</p>
                    <p className="text-xs text-slate-500">Receber resumos e lembretes por e-mail</p>
                  </div>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-surface-600">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={prefs.notify_email}
                    onChange={(e) => setPrefs(prev => ({ ...prev, notify_email: e.target.checked }))}
                  />
                  <div className={`h-5 w-5 rounded-full bg-white shadow transform transition-transform peer-checked:translate-x-5 ${prefs.notify_email ? 'bg-amber-500 !translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating || (username === profile?.username && !password && prefs.notify_email === profile?.notify_email && prefs.notify_push === profile?.notify_push)}
              className="btn-primary flex items-center gap-2"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
