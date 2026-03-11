import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não foi definido')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não foi definido')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)