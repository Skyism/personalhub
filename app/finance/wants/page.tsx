import { createClient } from '@/lib/supabase/server';
import { getCurrentWantsPeriod } from '@/lib/wants/periods';
import { WantsBudgetForm } from './components/budget-form';
import { WantsOverview } from './components/overview';

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

export default async function WantsPage() {
  const supabase = await createClient();
  const period = getCurrentWantsPeriod();

  // Fetch current period budget
  const { data: budget } = await supabase
    .from('wants_budgets')
    .select('id, total_amount, period_start, period_end')
    .eq('user_id', TEMP_USER_ID)
    .eq('period_start', period.periodStart)
    .maybeSingle();

  // Fetch total spent this period
  let totalSpent = 0;
  if (budget) {
    const { data: transactions } = await supabase
      .from('wants_transactions')
      .select('amount')
      .eq('wants_budget_id', budget.id);

    totalSpent = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wants Budget</h1>
        <p className="text-muted-foreground mt-1">{period.label} (6-month period)</p>
      </div>

      {!budget ? (
        <WantsBudgetForm period={period} />
      ) : (
        <WantsOverview budget={budget} totalSpent={totalSpent} period={period} />
      )}
    </div>
  );
}
