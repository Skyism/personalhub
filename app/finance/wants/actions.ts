'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function createWantsBudget(periodStart: string, periodEnd: string, totalAmount: number) {
  const supabase = await createClient();

  const { error } = await supabase.from('wants_budgets').insert({
    user_id: TEMP_USER_ID,
    period_start: periodStart,
    period_end: periodEnd,
    total_amount: totalAmount,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/finance/wants');
  return { success: true };
}

export async function updateWantsBudget(budgetId: number, totalAmount: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wants_budgets')
    .update({ total_amount: totalAmount, updated_at: new Date().toISOString() })
    .eq('id', budgetId);

  if (error) throw new Error(error.message);

  revalidatePath('/finance/wants');
  return { success: true };
}

export async function createWantsTransaction(budgetId: number, amount: number, note: string | null, transactionDate: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('wants_transactions').insert({
    user_id: TEMP_USER_ID,
    wants_budget_id: budgetId,
    amount,
    note,
    transaction_date: transactionDate,
    source: 'manual',
  });

  if (error) throw new Error(error.message);

  revalidatePath('/finance/wants');
  return { success: true };
}

export async function updateWantsTransaction(transactionId: number, amount: number, note: string | null, transactionDate: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wants_transactions')
    .update({ amount, note, transaction_date: transactionDate, updated_at: new Date().toISOString() })
    .eq('id', transactionId);

  if (error) throw new Error(error.message);

  revalidatePath('/finance/wants');
  return { success: true };
}

export async function deleteWantsTransaction(transactionId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wants_transactions')
    .delete()
    .eq('id', transactionId);

  if (error) throw new Error(error.message);

  revalidatePath('/finance/wants');
  return { success: true };
}
