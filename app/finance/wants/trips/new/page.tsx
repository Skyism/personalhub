import { createClient } from '@/lib/supabase/server';
import { getCurrentWantsPeriod } from '@/lib/wants/periods';
import TopAppBar from '@/components/navigation/TopAppBar';
import { TripForm } from '../components/trip-form';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

export default async function NewTripPage() {
  const supabase = await createClient();
  const period = getCurrentWantsPeriod();

  // Fetch current period budget (needed for wants_budget_id FK)
  const { data: budget } = await supabase
    .from('wants_budgets')
    .select('id')
    .eq('user_id', TEMP_USER_ID)
    .eq('period_start', period.periodStart)
    .maybeSingle();

  return (
    <>
      <TopAppBar fallbackHref="/finance/wants/trips" />
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">New Trip</h1>

        {!budget ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-muted-foreground">
                You need to set up a wants budget for {period.label} before creating a trip.
              </p>
              <Link href="/finance/wants">
                <Button>Set Up Wants Budget</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <TripForm wantsBudgetId={budget.id} />
        )}
      </div>
    </>
  );
}
