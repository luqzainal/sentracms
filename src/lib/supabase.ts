import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use fallback values for demo mode if environment variables are not set
const fallbackUrl = 'https://demo.supabase.co'
const fallbackKey = 'demo-key'
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Running in demo mode.')
const finalUrl = supabaseUrl || fallbackUrl
const finalKey = supabaseAnonKey || fallbackKey
export const supabase = createClient(finalUrl, finalKey)