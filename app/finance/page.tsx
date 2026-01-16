import Link from 'next/link'

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Finance</h1>
        <p className="text-muted-foreground mb-8">Track your budget and expenses</p>

        <div className="space-y-4">
          <Link
            href="/finance/budgets"
            className="block p-6 bg-card rounded-lg shadow hover:shadow-md transition-shadow border border-border"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">Budgets</h2>
            <p className="text-muted-foreground">View and manage your monthly budgets</p>
          </Link>

          <Link
            href="/finance/wants"
            className="block p-6 bg-card rounded-lg shadow hover:shadow-md transition-shadow border border-border"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">Wants Budget</h2>
            <p className="text-muted-foreground">Track semi-annual wants spending (Jan-Jun, Jul-Dec)</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
