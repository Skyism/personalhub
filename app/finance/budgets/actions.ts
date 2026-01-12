'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export type CreateBudgetResult = {
  success: boolean
  error?: string
  budgetId?: number
}

export async function createBudget(
  month: string,
  totalBudget: number
): Promise<CreateBudgetResult> {
  // Validate month format (YYYY-MM)
  const monthRegex = /^\d{4}-\d{2}$/
  if (!monthRegex.test(month)) {
    return { success: false, error: 'Invalid month format. Expected YYYY-MM.' }
  }

  // Validate totalBudget is positive
  if (totalBudget <= 0) {
    return { success: false, error: 'Budget must be greater than 0.' }
  }

  try {
    const supabase = await createClient()

    // Check if budget already exists for this month
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', TEMP_USER_ID)
      .eq('month', month)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'A budget for this month already exists.' }
    }

    // Insert the new budget
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: TEMP_USER_ID,
        month,
        total_budget: totalBudget,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating budget:', error)
      return { success: false, error: 'Failed to create budget. Please try again.' }
    }

    // Revalidate the budgets list page
    revalidatePath('/finance/budgets')

    return { success: true, budgetId: data.id }
  } catch (error) {
    console.error('Unexpected error creating budget:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
