import { createClient } from '@/lib/supabase/server'

/**
 * Match a category string to a category ID in the database.
 * Performs case-insensitive exact match on category name.
 * Returns null if no match found (transaction will be uncategorized).
 */
export async function matchCategoryToId(
  categoryString: string | null,
  userId: string
): Promise<number | null> {
  if (!categoryString) {
    return null
  }

  const supabase = await createClient()

  // Query categories table for this user
  // Use case-insensitive match with ilike
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', categoryString)
    .maybeSingle()

  if (error || !data) {
    // No match found, return null (uncategorized)
    return null
  }

  return data.id
}
