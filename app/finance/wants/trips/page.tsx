import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TopAppBar from '@/components/navigation/TopAppBar';
import { Button } from '@/components/ui/button';
import { TripCard } from './components/trip-card';
import { Card, CardContent } from '@/components/ui/card';

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

export default async function TripsPage() {
  const supabase = await createClient();

  // Fetch all trips
  const { data: trips } = await supabase
    .from('wants_trips')
    .select('id, name, destination, start_date, end_date, budget_amount, status, wants_budget_id')
    .eq('user_id', TEMP_USER_ID)
    .order('start_date', { ascending: false });

  const allTrips = trips ?? [];

  // Fetch total spent for each trip
  const tripSpentMap: Record<number, number> = {};
  if (allTrips.length > 0) {
    const tripIds = allTrips.map((t) => t.id);
    const { data: transactions } = await supabase
      .from('wants_trip_transactions')
      .select('trip_id, amount')
      .in('trip_id', tripIds);

    (transactions ?? []).forEach((t) => {
      tripSpentMap[t.trip_id] = (tripSpentMap[t.trip_id] || 0) + Number(t.amount);
    });
  }

  const activeTrips = allTrips.filter((t) => t.status === 'active');
  const plannedTrips = allTrips.filter((t) => t.status === 'planned');
  const completedTrips = allTrips.filter((t) => t.status === 'completed');

  return (
    <>
      <TopAppBar fallbackHref="/finance/wants" />
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Trips</h1>
          <Link href="/finance/wants/trips/new">
            <Button size="lg" className="h-11">New Trip</Button>
          </Link>
        </div>

        {allTrips.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No trips yet. Create one to start tracking your travel budget.
              </p>
              <Link href="/finance/wants/trips/new">
                <Button>Create Your First Trip</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active Trips */}
            {activeTrips.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Active</h2>
                <div className="space-y-3">
                  {activeTrips.map((trip, i) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      totalSpent={tripSpentMap[trip.id] || 0}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Planned Trips */}
            {plannedTrips.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Planned</h2>
                <div className="space-y-3">
                  {plannedTrips.map((trip, i) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      totalSpent={tripSpentMap[trip.id] || 0}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Trips */}
            {completedTrips.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Completed</h2>
                <div className="space-y-3">
                  {completedTrips.map((trip, i) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      totalSpent={tripSpentMap[trip.id] || 0}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
