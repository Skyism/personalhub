import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'
import BudgetSelector from './BudgetSelector'
import AnalyticsCharts from './AnalyticsCharts'
import TopAppBar from '@/components/navigation/TopAppBar'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

type Budget = Tables<'budgets'>

type CategoryData = {
  name: string
  value: number
  color: string | null
}

type DailySpending = {
  date: string
  amount: number
  formattedDate: string
}

type CategoryComparison = {
  category: string
  budgeted: number
  spent: number
  color: string | null
}

type PageProps = {
  searchParams: Promise<{ budget_id?: string }>
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch user's budgets sorted by month DESC (most recent first)
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', TEMP_USER_ID)
    .order('month', { ascending: false })

  // Handle no budgets case
  if (!budgets || budgets.length === 0) {
    return (
      <>
        <TopAppBar fallbackHref="/finance" />
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-6xl mx-auto mt-8">
            <div className="mb-6">
              <Link
                href="/finance/budgets"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                &larr; Back to Budgets
              </Link>
            </div>
            <div className="bg-card rounded-lg shadow p-12 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">No Budgets Yet</h1>
              <p className="text-muted-foreground mb-6">
                Create your first budget to see analytics
              </p>
              <Link
                href="/finance/budgets/new"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Create Budget
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Get budget_id from searchParams (default to most recent if not provided)
  const budgetId = params.budget_id ? parseInt(params.budget_id) : budgets[0].id

  // Fetch selected budget with transactions and category allocations
  const { data: budget } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', budgetId)
    .eq('user_id', TEMP_USER_ID)
    .maybeSingle()

  // If budget not found, redirect to most recent
  if (!budget) {
    return (
      <>
        <TopAppBar fallbackHref="/finance" />
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-6xl mx-auto mt-8">
            <div className="bg-card rounded-lg shadow p-8 text-center">
              <p className="text-muted-foreground mb-4">Budget not found</p>
              <Link
                href={`/finance/analytics?budget_id=${budgets[0].id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to latest budget
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', TEMP_USER_ID)
    .order('name', { ascending: true })

  // Fetch category allocations
  const { data: allocations } = await supabase
    .from('category_allocations')
    .select('*')
    .eq('budget_id', budgetId)
    .eq('user_id', TEMP_USER_ID)

  // Fetch transactions with category information
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name,
        color
      )
    `)
    .eq('budget_id', budgetId)
    .eq('user_id', TEMP_USER_ID)
    .order('transaction_date', { ascending: true })

  // Calculate per-category spending from ALL transactions
  const categorySpending = transactions?.reduce((acc, t) => {
    const categoryId = t.category_id
    if (categoryId !== null) {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      acc[categoryId] = (acc[categoryId] || 0) + amount
    }
    return acc
  }, {} as Record<number, number>) || {}

  // Build category breakdown with allocations
  const categoryBreakdown = allocations?.map(allocation => {
    const category = categories?.find(c => c.id === allocation.category_id)
    const spent = categorySpending[allocation.category_id] || 0
    const allocated = typeof allocation.allocated_amount === 'string' 
      ? parseFloat(allocation.allocated_amount) 
      : allocation.allocated_amount

    return {
      id: allocation.category_id,
      name: category?.name || 'Unknown',
      color: category?.color || null,
      allocated,
      spent
    }
  }) || []

  // 1. Category spending data for pie chart - include ALL categories with spending
  // This includes categories that have transactions but may not have allocations
  const categoryEntries = Object.entries(categorySpending) as [string, number][]
  const categoryData: CategoryData[] = categoryEntries
    .filter(([_, spent]) => spent > 0)
    .map(([categoryIdStr, spent]) => {
      const categoryId = parseInt(categoryIdStr, 10)
      const category = categories?.find(c => c.id === categoryId)
      // Also check if category info came from the transaction join (Supabase returns object, not array)
      const transactionWithCategory = transactions?.find(t => t.category_id === categoryId)
      const categoryFromTransaction = transactionWithCategory?.categories as { name?: string; color?: string } | null
      return {
        name: category?.name || categoryFromTransaction?.name || `Category ${categoryId}`,
        value: spent,
        color: category?.color || categoryFromTransaction?.color || null
      }
    })

  // 2. Daily spending data for line chart
  const dailySpendingMap = transactions?.reduce((acc, t) => {
    // Extract date part from timestamp (YYYY-MM-DD)
    const dateStr = typeof t.transaction_date === 'string' 
      ? t.transaction_date.split('T')[0] 
      : new Date(t.transaction_date).toISOString().split('T')[0]
    const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
    acc[dateStr] = (acc[dateStr] || 0) + amount
    return acc
  }, {} as Record<string, number>) || {}

  const dailyData: DailySpending[] = Object.entries(dailySpendingMap)
    .map(([date, amount]) => {
      // Parse YYYY-MM-DD in local timezone to avoid UTC midnight issues
      const [year, month, day] = date.split('-').map(Number)
      const localDate = new Date(year, month - 1, day)

      return {
        date,
        amount: amount as number,
        formattedDate: localDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  // 3. Budget comparison data for bar chart
  // Include all allocations, and also categories with spending but no allocations
  const allocationMap = new Map(
    categoryBreakdown.map(c => [c.id, c])
  )
  
  // Get all categories that have spending but no allocation
  const categoriesWithSpendingOnly = categoryEntries
    .filter(([categoryIdStr, spent]) => {
      const categoryId = parseInt(categoryIdStr)
      return spent > 0 && !allocationMap.has(categoryId)
    })
    .map(([categoryIdStr, spent]) => {
      const categoryId = parseInt(categoryIdStr)
      const category = categories?.find(c => c.id === categoryId)
      return {
        category: category?.name || 'Unknown',
        budgeted: 0,
        spent,
        color: category?.color || null
      }
    })

  const comparisonData: CategoryComparison[] = [
    ...categoryBreakdown.map(c => ({
      category: c.name,
      budgeted: c.allocated,
      spent: c.spent,
      color: c.color
    })),
    ...categoriesWithSpendingOnly
  ]

  return (
    <>
      <TopAppBar fallbackHref="/finance" />
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto mt-8">
          <div className="mb-6">
            <Link
              href="/finance/budgets"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              &larr; Back to Budgets
            </Link>
          </div>

          {/* Header with budget selector */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <Link
                href="/finance/analytics/yearly"
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Yearly analytics
              </Link>
            </div>
            <BudgetSelector budgets={budgets} selectedBudgetId={budgetId} />
          </div>

          {/* Charts rendered in Client Component with dynamic imports */}
          <AnalyticsCharts
            categoryData={categoryData}
            dailyData={dailyData}
            comparisonData={comparisonData}
            budgetTotal={typeof budget.total_budget === 'string' 
              ? parseFloat(budget.total_budget) 
              : budget.total_budget}
          />
        </div>
      </div>
    </>
  )
}
