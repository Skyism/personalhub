import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TopAppBar from '@/components/navigation/TopAppBar'
import YearSelector from './YearSelector'
import YearlyMonthlyChart, { type MonthlyDatum } from '@/components/charts/YearlyMonthlyChart'

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

type CategoryRow = {
  name: string
  amount: number
  color: string | null
}

type PageProps = {
  searchParams: Promise<{ year?: string }>
}

export default async function YearlyAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const currentYear = new Date().getFullYear()
  const requestedYear = params.year ? parseInt(params.year, 10) : currentYear
  const year = Number.isNaN(requestedYear) ? currentYear : Math.max(2000, Math.min(2100, requestedYear))

  const yearStart = `${year}-01-01`
  const yearEnd = `${year + 1}-01-01`

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, amount, transaction_date, category_id')
    .eq('user_id', TEMP_USER_ID)
    .gte('transaction_date', yearStart)
    .lt('transaction_date', yearEnd)

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color')
    .eq('user_id', TEMP_USER_ID)

  const categoryMap = new Map(categories?.map((c) => [c.id, { name: c.name, color: c.color }]) ?? [])

  const totalSpent = transactions?.reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount), 0) ?? 0
  const transactionCount = transactions?.length ?? 0

  const byCategory = new Map<number | null, number>()
  transactions?.forEach((t) => {
    const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
    const key = t.category_id ?? null
    byCategory.set(key, (byCategory.get(key) ?? 0) + amount)
  })

  const categoryBreakdown: CategoryRow[] = Array.from(byCategory.entries())
    .map(([categoryId, amount]) => ({
      name: categoryId === null ? 'Uncategorized' : (categoryMap.get(categoryId)?.name ?? `Category ${categoryId}`),
      amount,
      color: categoryId === null ? null : (categoryMap.get(categoryId)?.color ?? null)
    }))
    .sort((a, b) => b.amount - a.amount)

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlySums = Array.from({ length: 12 }, () => 0)
  transactions?.forEach((t) => {
    const dateStr = typeof t.transaction_date === 'string' ? t.transaction_date : new Date(t.transaction_date).toISOString()
    const month = parseInt(dateStr.slice(5, 7), 10)
    if (month >= 1 && month <= 12) {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      monthlySums[month - 1] += amount
    }
  })
  const monthlyData: MonthlyDatum[] = monthLabels.map((monthLabel, i) => ({
    month: i + 1,
    monthLabel,
    amount: monthlySums[i]
  }))

  const hasData = transactionCount > 0

  return (
    <>
      <TopAppBar fallbackHref="/finance/analytics" />
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto mt-8">
          <div className="mb-6">
            <Link
              href="/finance/analytics"
              className="text-primary hover:underline font-medium"
            >
              ← Back to Analytics
            </Link>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">Yearly Spending</h1>
            <YearSelector selectedYear={year} />
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border shadow p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Summary</h2>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} in {year}
              </p>
            </div>

            {!hasData && (
              <div className="bg-card rounded-lg border border-border shadow p-8 text-center">
                <p className="text-muted-foreground">No transactions in {year}</p>
              </div>
            )}

            {hasData && (
              <>
                <div className="bg-card rounded-lg border border-border shadow p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Spending by month</h2>
                  <YearlyMonthlyChart data={monthlyData} />
                </div>
                <div className="bg-card rounded-lg border border-border shadow p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Spending by category</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 pr-4 font-medium text-foreground">Category</th>
                        <th className="pb-2 font-medium text-foreground text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryBreakdown.map((row) => (
                        <tr key={row.name} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-4 text-foreground flex items-center gap-2">
                            {row.color && (
                              <span
                                className="inline-block w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: row.color }}
                              />
                            )}
                            {row.name}
                          </td>
                          <td className="py-2 text-foreground text-right font-medium">
                            {formatCurrency(row.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
