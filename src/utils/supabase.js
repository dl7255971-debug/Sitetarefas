import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://usvqeaejllrfnnvubnbz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdnFlYWVqbGxyZm5udnVibmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzc0MzYsImV4cCI6MjA5MjcxMzQzNn0.H_8Ca_XzBTg6vPFD7vTkCpzuH_mdIyoVyL1C11tAhPs'

export const supabase = createClient(supabaseUrl, supabaseKey)
