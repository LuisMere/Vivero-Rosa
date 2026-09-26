import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(value) {
  if (!value) return value
  return value.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '')
}

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null
