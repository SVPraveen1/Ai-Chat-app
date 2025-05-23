
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://etwasycpohekfaoacffr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0d2FzeWNwb2hla2Zhb2FjZmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTU4NTQsImV4cCI6MjA2MzQ5MTg1NH0.3C0bT7rM3lrXVVMKWUuWSbNG3anHLAD3WdVIKJd7lI4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Message {
  id: string
  content: string
  sender_id: string
  receiver_id?: string
  created_at: string
  is_edited?: boolean
  edited_at?: string
}

export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  is_online?: boolean
  last_seen?: string
}
