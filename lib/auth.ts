import { supabase } from './supabase'

export async function signUp(email: string, password: string, userData: any) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  
  return { data, error }
}

export async function signIn(email: string, password: string) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  return { data, error }
}

export async function signOut() {
  if (!supabase) {
    return { error: { message: 'Supabase not configured' } }
  }
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  if (!supabase) {
    return { user: null, error: { message: 'Supabase not configured' } }
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}