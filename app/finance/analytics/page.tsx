import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'
import BudgetSelector from './BudgetSelector'
import AnalyticsCharts from './AnalyticsCharts'

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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto mt-8">
          <div className="mb-6">
            <Link
              href="/finance/budgets"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              &larr; Back to Budgets
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Budgets Yet</h1>
            <p className="text-gray-600 mb-6">
              Create your first budget to see analytics
            </p>
            <Link
              href="/finance/budgets/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Budget
            </Link>
          </div>
        </div>
      </div>
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Budget not found</p>
            <Link
              href={`/finance/analytics?budget_id=${budgets[0].id}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to latest budget
            </Link>
          </div>
        </div>
      </div>
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

  // Calculate per-category spending
  const categorySpending = transactions?.reduce((acc, t) => {
    const categoryId = t.category_id
    if (categoryId !== null) {
      acc[categoryId] = (acc[categoryId] || 0) + t.amount
    }
    return acc
  }, {} as Record<number, number>) || {}

  // Build category breakdown with allocations
  const categoryBreakdown = allocations?.map(allocation => {
    const category = categories?.find(c => c.id === allocation.category_id)
    const spent = categorySpending[allocation.category_id] || 0

    return {
      id: allocation.category_id,
      name: category?.name || 'Unknown',
      color: category?.color || null,
      allocated: allocation.allocated_amount,
      spent
    }
  }) || []

  // 1. Category spending data for pie chart
  const categoryData: CategoryData[] = categoryBreakdown
    .filter(c => c.spent > 0)
    .map(c => ({
      name: c.name,
      value: c.spent,
      color: c.color
    }))

  // 2. Daily spending data for line chart
  const dailySpendingMap = transactions?.reduce((acc, t) => {
    const date = t.transaction_date
    acc[date] = (acc[date] || 0) + t.amount
    return acc
  }, {} as Record<string, number>) || {}

  const dailyData: DailySpending[] = Object.entries(dailySpendingMap)
    .map(([date, amount]) => ({
      date,
      amount: amount as number,
      formattedDate: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // 3. Budget comparison data for bar chart
  const comparisonData: CategoryComparison[] = categoryBreakdown.map(c => ({
    category: c.name,
    budgeted: c.allocated,
    spent: c.spent,
    color: c.color
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <BudgetSelector budgets={budgets} selectedBudgetId={budgetId} />
        </div>

        {/* Charts rendered in Client Component with dynamic imports */}
        <AnalyticsCharts
          categoryData={categoryData}
          dailyData={dailyData}
          comparisonData={comparisonData}
          budgetTotal={budget.total_budget}
        />
      </div>
    </div>
  )
}
