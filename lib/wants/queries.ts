import { createClient } from '@/lib/supabase/server';
import { getCurrentWantsPeriod } from './periods';

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Finds the wants budget for the current semi-annual period.
 * Does not auto-create budgets - user should configure via UI first.
 *
 * @returns Object with budget data (or null) and created flag
 *
 * @example
 * const { budget, created } = await findOrCreateCurrentWantsBudget();
 * if (!budget) {
 *   // No budget exists for current period - show error to user
 * }
 */
export async function findOrCreateCurrentWantsBudget() {
  const supabase = await createClient();
  const period = getCurrentWantsPeriod();

  // Try to find existing budget for current period
  const { data: existing } = await supabase
    .from('wants_budgets')
    .select('id, total_amount, period_start, period_end')
    .eq('user_id', TEMP_USER_ID)
    .eq('period_start', period.periodStart)
    .maybeSingle();

  if (existing) {
    return { budget: existing, created: false };
  }

  // No budget exists for current period - return null so webhook can respond appropriately
  // (Don't auto-create budget - user should set it up first via UI)
  return { budget: null, created: false };
}

/**
 * Creates a wants transaction in the database.
 *
 * @param params - Transaction parameters including budget ID, amount, note, and Twilio metadata
 * @returns Created transaction data with ID
 * @throws Error if insert fails
 *
 * @example
 * await createWantsTransaction({
 *   wantsBudgetId: 1,
 *   amount: 25.50,
 *   note: 'coffee',
 *   twilioMessageId: 'SM1234567890',
 *   twilioFrom: '+15555551234',
 * });
 */
export async function createWantsTransaction(params: {
  wantsBudgetId: number;
  amount: number;
  note: string | null;
  twilioMessageId: string;
  twilioFrom: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wants_transactions')
    .insert({
      user_id: TEMP_USER_ID,
      wants_budget_id: params.wantsBudgetId,
      amount: params.amount,
      note: params.note,
      source: 'sms',
      twilio_message_id: params.twilioMessageId,
      transaction_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}
