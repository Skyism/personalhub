import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopAppBar from '@/components/navigation/TopAppBar';
import { TripOverview } from '../components/trip-overview';

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch trip
  const { data: trip } = await supabase
    .from('wants_trips')
    .select('id, name, destination, start_date, end_date, budget_amount, status, wants_budget_id')
    .eq('id', parseInt(id, 10))
    .eq('user_id', TEMP_USER_ID)
    .single();

  if (!trip) {
    notFound();
  }

  // Fetch trip transactions
  const { data } = await supabase
    .from('wants_trip_transactions')
    .select('id, amount, note, transaction_date, source, created_at')
    .eq('trip_id', trip.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  const transactions = data ?? [];
  const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <>
      <TopAppBar fallbackHref="/finance/wants/trips" />
      <div className="container mx-auto p-4 space-y-6">
        <TripOverview trip={trip} totalSpent={totalSpent} transactions={transactions} />
      </div>
    </>
  );
}
