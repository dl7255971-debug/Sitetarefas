import { useState, useRef, useEffect } from 'react'
import { User, Mail, Lock, Camera, Loader2, Save, Check, Bell, BellRing } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useNotifications } from '../hooks/useNotifications'

export default function Profile() {
  const { user } = useAuth()
  const { profile, loading, updateUsername, uploadAvatar, updatePassword, updatePreferences } = useProfile()
  const { requestPermission, sendNotification } = useNotifications([], profile)
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [prefs, setPrefs] = useState({
    notify_email: false,
    notify_push: true
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const fileInputRef = useRef(null)

  // Sincronizar state inicial quando profile carregar
  useEffect(() => {
    if (profile) {
      if (username === '') setUsername(profile.username || '')
      setPrefs({
        notify_email: profile.notify_email ?? false,
        notify_push: profile.notify_push ?? true
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

  const handleTestNotification = async () => {
    const granted = await requestPermission()
    if (granted) {
      sendNotification('Teste de Notificação ✅', {
        body: 'Parabéns! Suas notificações do TaskFlow estão configuradas corretamente.',
        tag: 'test-notification',
        force: true
      })
    } else {
      alert('Parece que as notificações estão bloqueadas no seu navegador. Por favor, autorize nas configurações do navegador (ícone de cadeado na barra de endereço).')
    }
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

    if (password.length >= 6) {
      const { error } = await updatePassword(password)
      if (error) {
        hasError = true
        setMessage({ text: 'Erro ao atualizar a senha.', type: 'error' })
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
      setPassword('')
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
          Gerencie suas informações e preferências de conta.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-24 h-24 rounded-full bg-surface-800 border-2 border-amber-500/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-amber-500">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-slate-600" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <h3 className="text-slate-100 font-bold mt-4 text-lg">
            {profile?.username || 'Usuário'}
          </h3>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <Mail size={14} /> {user?.email}
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-8 flex items-center gap-3 animate-slide-in ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {message.type === 'success' ? <Check size={18} /> : <Lock size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Notificações no TOPO */}
        <div className="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 shadow-xl shadow-amber-500/5">
          <h4 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
            <Bell size={20} className="text-amber-400" />
            Configurações de Notificação
          </h4>
          <p className="text-sm text-slate-400 mb-5">
            Ative para não esquecer suas tarefas importantes.
          </p>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-surface-900/50 border border-white/10 rounded-xl cursor-pointer hover:border-amber-500/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <BellRing size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Notificações Push</p>
                  <p className="text-xs text-slate-500">Alertas em tempo real no navegador</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTestNotification(); }}
                  className="text-[10px] bg-amber-500 text-amber-950 font-bold px-2 py-1 rounded hover:bg-amber-400 transition-colors"
                >
                  TESTAR
                </button>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-surface-600">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={prefs.notify_push}
                    onChange={(e) => setPrefs(prev => ({ ...prev, notify_push: e.target.checked }))}
                  />
                  <div className={`h-5 w-5 rounded-full shadow transform transition-transform peer-checked:translate-x-5 ${prefs.notify_push ? 'bg-amber-500' : 'bg-white translate-x-1'}`} />
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-surface-900/50 border border-white/10 rounded-xl cursor-pointer hover:border-slate-500/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-500/10 text-slate-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Notificações por E-mail</p>
                  <p className="text-xs text-slate-500">Resumos diários na sua caixa de entrada</p>
                </div>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-surface-600">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={prefs.notify_email}
                  onChange={(e) => setPrefs(prev => ({ ...prev, notify_email: e.target.checked }))}
                />
                <div className={`h-5 w-5 rounded-full shadow transform transition-transform peer-checked:translate-x-5 ${prefs.notify_email ? 'bg-amber-500' : 'bg-white translate-x-1'}`} />
              </div>
            </label>
          </div>
        </div>

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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
              Nova Senha (deixe em branco para manter)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-800/50 border border-surface-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
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
