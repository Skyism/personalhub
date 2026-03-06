'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

// ── Trip CRUD ──

export async function createTrip(
  name: string,
  destination: string | null,
  startDate: string,
  endDate: string,
  budgetAmount: number,
  wantsBudgetId: number
) {
  const supabase = await createClient();

  const { error } = await supabase.from('wants_trips').insert({
    user_id: TEMP_USER_ID,
    wants_budget_id: wantsBudgetId,
    name,
    destination,
    start_date: startDate,
    end_date: endDate,
    budget_amount: budgetAmount,
    status: 'planned',
  });

  if (error) throw new Error(error.message);

  revalidatePath('/finance/wants/trips');
  return { success: true };
}

export async function updateTrip(
  tripId: number,
  name: string,
  destination: string | null,
  startDate: string,
  endDate: string,
  budgetAmount: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wants_trips')
    .update({
      name,
      destination,
      start_date: startDate,
      end_date: endDate,
      budget_amount: budgetAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tripId);

  if (error) throw new Error(error.message);

  revalidatePath('/finance/wants/trips');
  revalidatePath(`/finance/wants/trips/${tripId}`);
  return { success: true };
}

export async function activateTrip(tripId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wants_trips')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', tripId);

  if (error) {
    if (error.message.includes('idx_wants_trips_one_active')) {
      throw new Error('Another trip is already active. Complete it first.');
    }
    throw new Error(error.message);
  }

  revalidatePath('/finance/wants/trips');
  revalidatePath(`/finance/wants/trips/${tripId}`);
  return { success: true };
}

export async function completeTrip(tripId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wants_trips')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', tripId);

  if (error) throw new Error(error.message);

  revalidatePath('/finance/wants/trips');
  revalidatePath(`/finance/wants/trips/${tripId}`);
  return { success: true };
}

export async function deleteTrip(tripId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wants_trips')
    .delete()
    .eq('id', tripId);

  if (error) throw new Error(error.message);

  revalidatePath('/finance/wants/trips');
  return { success: true };
}

// ── Trip Transaction CRUD ──

export async function createTripTransaction(
  tripId: number,
  wantsBudgetId: number,
  amount: number,
  note: string | null,
  transactionDate: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from('wants_trip_transactions').insert({
    user_id: TEMP_USER_ID,
    trip_id: tripId,
    wants_budget_id: wantsBudgetId,
    amount,
    note,
    transaction_date: transactionDate,
    source: 'manual',
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/finance/wants/trips/${tripId}`);
  revalidatePath('/finance/wants');
  return { success: true };
}

export async function updateTripTransaction(
  transactionId: number,
  tripId: number,
  amount: number,
  note: string | null,
  transactionDate: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wants_trip_transactions')
    .update({
      amount,
      note,
      transaction_date: transactionDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/finance/wants/trips/${tripId}`);
  revalidatePath('/finance/wants');
  return { success: true };
}

export async function deleteTripTransaction(transactionId: number, tripId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wants_trip_transactions')
    .delete()
    .eq('id', transactionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/finance/wants/trips/${tripId}`);
  revalidatePath('/finance/wants');
  return { success: true };
}
