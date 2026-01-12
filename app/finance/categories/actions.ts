'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function createCategory(name: string, color: string | null) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .insert({
      user_id: TEMP_USER_ID,
      name,
      color,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/finance/categories')
  return { success: true }
}

export async function updateCategory(id: number, name: string, color: string | null) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({ name, color })
    .eq('id', id)
    .eq('user_id', TEMP_USER_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/finance/categories')
  return { success: true }
}

export async function deleteCategory(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', TEMP_USER_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/finance/categories')
  return { success: true }
}
