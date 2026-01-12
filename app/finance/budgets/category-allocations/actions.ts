'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function setAllocation(
  budgetId: number,
  categoryId: number,
  amount: number
) {
  const supabase = await createClient()

  // Validate amount is positive
  if (amount <= 0) {
    return { success: false, error: 'Amount must be greater than 0' }
  }

  // Get budget total
  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select('total_budget')
    .eq('id', budgetId)
    .eq('user_id', TEMP_USER_ID)
    .single()

  if (budgetError || !budget) {
    return { success: false, error: 'Budget not found' }
  }

  // Get existing allocations for this budget (excluding the current category if updating)
  const { data: existingAllocations } = await supabase
    .from('category_allocations')
    .select('allocated_amount, category_id')
    .eq('budget_id', budgetId)
    .eq('user_id', TEMP_USER_ID)

  // Calculate total allocated (excluding current category to handle updates)
  const totalAllocated = (existingAllocations || [])
    .filter((a) => a.category_id !== categoryId)
    .reduce((sum, a) => sum + a.allocated_amount, 0)

  // Check if new total would exceed budget
  if (totalAllocated + amount > budget.total_budget) {
    return {
      success: false,
      error: `Allocation would exceed budget. Available: $${(budget.total_budget - totalAllocated).toFixed(2)}`,
    }
  }

  // Upsert allocation (insert or update if exists)
  const { error } = await supabase
    .from('category_allocations')
    .upsert(
      {
        budget_id: budgetId,
        category_id: categoryId,
        allocated_amount: amount,
        user_id: TEMP_USER_ID,
      },
      {
        onConflict: 'budget_id,category_id',
      }
    )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/finance/budgets/${budgetId}`)
  return { success: true }
}

export async function removeAllocation(budgetId: number, categoryId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('category_allocations')
    .delete()
    .eq('budget_id', budgetId)
    .eq('category_id', categoryId)
    .eq('user_id', TEMP_USER_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/finance/budgets/${budgetId}`)
  return { success: true }
}
