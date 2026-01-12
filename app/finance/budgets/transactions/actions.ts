'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export type TransactionResult = {
  success: boolean
  error?: string
  transactionId?: number
}

export async function createTransaction(
  formData: FormData,
  budgetId: number
): Promise<TransactionResult> {
  try {
    // Extract form data
    const amountStr = formData.get('amount') as string
    const categoryIdStr = formData.get('category_id') as string
    const note = (formData.get('note') as string)?.trim() || null
    const dateStr = formData.get('date') as string

    // Parse and validate amount
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    // Parse category_id (null if empty string or "Uncategorized")
    const categoryId = categoryIdStr && categoryIdStr !== '' ? parseInt(categoryIdStr) : null
    if (categoryIdStr && categoryIdStr !== '' && (isNaN(categoryId!) || categoryId! <= 0)) {
      return { success: false, error: 'Invalid category selected' }
    }

    // Validate date
    if (!dateStr) {
      return { success: false, error: 'Transaction date is required' }
    }

    const transactionDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    transactionDate.setHours(0, 0, 0, 0)

    if (transactionDate > today) {
      return { success: false, error: 'Transaction date cannot be in the future' }
    }

    // Validate note length
    if (note && note.length > 500) {
      return { success: false, error: 'Note must be 500 characters or less' }
    }

    const supabase = await createClient()

    // Verify budget exists and belongs to user
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('id')
      .eq('id', budgetId)
      .eq('user_id', TEMP_USER_ID)
      .maybeSingle()

    if (budgetError || !budget) {
      return { success: false, error: 'Budget not found or access denied' }
    }

    // If category_id is provided, verify it exists and belongs to user
    if (categoryId !== null) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', categoryId)
        .eq('user_id', TEMP_USER_ID)
        .maybeSingle()

      if (categoryError || !category) {
        return { success: false, error: 'Category not found or access denied' }
      }
    }

    // Insert transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: TEMP_USER_ID,
        budget_id: budgetId,
        category_id: categoryId,
        amount,
        note,
        transaction_date: dateStr,
        source: 'manual',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return { success: false, error: 'Failed to create transaction. Please try again.' }
    }

    // Revalidate the budget detail page
    revalidatePath(`/finance/budgets/${budgetId}`)

    return { success: true, transactionId: data.id }
  } catch (error) {
    console.error('Unexpected error creating transaction:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

export async function deleteTransaction(
  transactionId: number,
  budgetId: number
): Promise<TransactionResult> {
  try {
    const supabase = await createClient()

    // Verify transaction exists and belongs to user
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('id, user_id')
      .eq('id', transactionId)
      .eq('user_id', TEMP_USER_ID)
      .maybeSingle()

    if (fetchError || !transaction) {
      return { success: false, error: 'Transaction not found or access denied' }
    }

    // Delete transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', TEMP_USER_ID)

    if (deleteError) {
      console.error('Error deleting transaction:', deleteError)
      return { success: false, error: 'Failed to delete transaction. Please try again.' }
    }

    // Revalidate the budget detail page
    revalidatePath(`/finance/budgets/${budgetId}`)

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting transaction:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

export async function updateTransactionCategory(
  transactionId: number,
  categoryId: number | null
): Promise<TransactionResult> {
  try {
    const supabase = await createClient()

    // If category_id is provided, verify it exists and belongs to user
    if (categoryId !== null) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', categoryId)
        .eq('user_id', TEMP_USER_ID)
        .maybeSingle()

      if (categoryError || !category) {
        return { success: false, error: 'Category not found or access denied' }
      }
    }

    // Update transaction category
    const { data, error: updateError } = await supabase
      .from('transactions')
      .update({ category_id: categoryId })
      .eq('id', transactionId)
      .eq('user_id', TEMP_USER_ID)
      .select('budget_id')
      .single()

    if (updateError || !data) {
      if (updateError?.code === 'PGRST116') {
        return { success: false, error: 'Transaction not found' }
      }
      console.error('Error updating transaction category:', updateError)
      return { success: false, error: 'Failed to update category. Please try again.' }
    }

    // Revalidate the budget detail page
    revalidatePath(`/finance/budgets/${data.budget_id}`)

    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating transaction category:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
