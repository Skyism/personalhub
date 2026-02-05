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

export type UpdateBudgetResult = {
  success: boolean
  error?: string
}

export async function updateBudget(
  budgetId: number,
  month: string,
  totalBudget: number
): Promise<UpdateBudgetResult> {
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

    // Check if another budget exists for this month (excluding current budget)
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', TEMP_USER_ID)
      .eq('month', month)
      .neq('id', budgetId)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'A budget for this month already exists.' }
    }

    // Update the budget
    const { error } = await supabase
      .from('budgets')
      .update({
        month,
        total_budget: totalBudget,
      })
      .eq('id', budgetId)
      .eq('user_id', TEMP_USER_ID)

    if (error) {
      console.error('Error updating budget:', error)
      return { success: false, error: 'Failed to update budget. Please try again.' }
    }

    // Revalidate both list and detail pages
    revalidatePath('/finance/budgets')
    revalidatePath(`/finance/budgets/${budgetId}`)

    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating budget:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

export type DeleteBudgetResult = {
  success: boolean
  error?: string
}

export async function deleteBudget(
  budgetId: number
): Promise<DeleteBudgetResult> {
  try {
    const supabase = await createClient()

    // Delete the budget (cascade will handle transactions and allocations)
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', TEMP_USER_ID)

    if (error) {
      console.error('Error deleting budget:', error)
      return { success: false, error: 'Failed to delete budget. Please try again.' }
    }

    // Revalidate the budgets list page
    revalidatePath('/finance/budgets')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting budget:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
