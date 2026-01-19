import { createClient } from '@/lib/supabase/server';
import { getCurrentWantsPeriod } from '@/lib/wants/periods';
import { WantsBudgetForm } from './components/budget-form';
import { WantsOverview } from './components/overview';
import TopAppBar from '@/components/navigation/TopAppBar';

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

  // Fetch total spent this period and transactions
  let totalSpent = 0;
  let transactions: any[] = [];
  if (budget) {
    const { data } = await supabase
      .from('wants_transactions')
      .select('id, amount, note, transaction_date, source, created_at')
      .eq('wants_budget_id', budget.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    transactions = data ?? [];
    totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  return (
    <>
      <TopAppBar fallbackHref="/finance" />
      <div className="container mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Wants Budget</h1>
          <p className="text-muted-foreground mt-1">{period.label} (6-month period)</p>
        </div>

        {!budget ? (
          <WantsBudgetForm period={period} />
        ) : (
          <WantsOverview budget={budget} totalSpent={totalSpent} period={period} transactions={transactions} />
        )}
      </div>
    </>
  );
}
