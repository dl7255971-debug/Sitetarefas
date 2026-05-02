import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        // If not found, that's fine (maybe trigger hasn't finished), try to insert
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: user.id }])
            .select()
            .single()
            
          if (!insertError && newProfile) {
            setProfile(newProfile)
          }
        } else {
          console.error('Erro ao carregar perfil:', error)
        }
      } else if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar perfil:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateUsername = async (username) => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ username, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      if (data) setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao atualizar nome de usuário:', error)
      return { data: null, error }
    }
  }

  const uploadAvatar = async (file) => {
    if (!user || !file) return
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      if (data) setProfile(data)
      
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao enviar avatar:', error)
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      return { data: null, error }
    }
  }

  const updatePreferences = async (preferences) => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...preferences, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      if (data) setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error)
      return { data: null, error }
    }
  }

  return {
    profile,
    loading,
    updateUsername,
    uploadAvatar,
    updatePassword,
    updatePreferences,
    refreshProfile: fetchProfile
  }
}
