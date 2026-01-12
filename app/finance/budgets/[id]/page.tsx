import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'
import CategoryAllocation from './CategoryAllocation'
import TransactionForm from './TransactionForm'
import TransactionItem from './TransactionItem'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

type Budget = Tables<'budgets'>

function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getDateGroup(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Reset time to compare dates only
  date.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)

  if (date.getTime() === today.getTime()) {
    return 'Today'
  } else if (date.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  } else {
    return 'Earlier'
  }
}

type TransactionWithCategory = Tables<'transactions'> & {
  categories: { name: string; color: string | null } | null
}

function groupTransactionsByDate(transactions: TransactionWithCategory[]): Record<string, TransactionWithCategory[]> {
  const groups: Record<string, TransactionWithCategory[]> = {
    'Today': [],
    'Yesterday': [],
    'Earlier': []
  }

  transactions.forEach(transaction => {
    const group = getDateGroup(transaction.transaction_date)
    groups[group].push(transaction)
  })

  return groups
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function BudgetDetailPage({ params }: PageProps) {
  const { id } = await params
  const budgetId = parseInt(id)

  if (isNaN(budgetId)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: budget, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', budgetId)
    .eq('user_id', TEMP_USER_ID)
    .maybeSingle()

  if (error) {
    console.error('Error fetching budget:', error)
    notFound()
  }

  if (!budget) {
    notFound()
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
    .order('transaction_date', { ascending: false })

  // Calculate spending summary
  const totalSpent = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
  const totalRemaining = budget.total_budget - totalSpent
  const spentPercentage = budget.total_budget > 0 ? (totalSpent / budget.total_budget) * 100 : 0

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
    const percentage = allocation.allocated_amount > 0 ? (spent / allocation.allocated_amount) * 100 : 0

    return {
      id: allocation.category_id,
      name: category?.name || 'Unknown',
      color: category?.color || null,
      allocated: allocation.allocated_amount,
      spent,
      percentage
    }
  }) || []

  // Get spending status color
  function getStatusColor(percentage: number): string {
    if (percentage >= 100) return 'red'
    if (percentage >= 80) return 'yellow'
    return 'green'
  }

  const statusColor = getStatusColor(spentPercentage)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-6">
          <Link
            href="/finance/budgets"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            &larr; Back to Budgets
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {formatMonth(budget.month)}
              </h1>
              <p className="text-gray-600 mt-1">
                Created {budget.created_at ? formatDate(budget.created_at) : 'Unknown'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(budget.total_budget)}
              </p>
              <p className="text-gray-600 text-sm">Total Budget</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {/* TODO: Implement edit functionality in future plan */}
            <button
              disabled
              className="flex-1 bg-gray-200 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
              title="Edit functionality coming soon"
            >
              Edit Budget
            </button>
            {/* TODO: Implement delete functionality in future plan */}
            <button
              disabled
              className="flex-1 bg-gray-200 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
              title="Delete functionality coming soon"
            >
              Delete Budget
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <CategoryAllocation
            budgetId={budgetId}
            categories={categories || []}
            allocations={allocations || []}
            totalBudget={budget.total_budget}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Spending Summary</h2>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-gray-600">
                  {formatCurrency(totalSpent)} spent of {formatCurrency(budget.total_budget)} budget
                </p>
                <p className={`text-sm font-semibold ${
                  statusColor === 'red' ? 'text-red-600' :
                  statusColor === 'yellow' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {totalRemaining >= 0
                    ? `${formatCurrency(totalRemaining)} remaining`
                    : `${formatCurrency(Math.abs(totalRemaining))} over budget`
                  }
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  statusColor === 'red' ? 'text-red-600' :
                  statusColor === 'yellow' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {spentPercentage.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  statusColor === 'red' ? 'bg-red-500' :
                  statusColor === 'yellow' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
          </div>

          {categoryBreakdown.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                {categoryBreakdown.map(category => {
                  const categoryStatusColor = getStatusColor(category.percentage)

                  return (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: category.color ? `${category.color}20` : '#E5E7EB',
                              color: category.color || '#6B7280'
                            }}
                          >
                            {category.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                          </p>
                          <p className={`text-xs font-semibold ${
                            categoryStatusColor === 'red' ? 'text-red-600' :
                            categoryStatusColor === 'yellow' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {category.percentage.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            categoryStatusColor === 'red' ? 'bg-red-500' :
                            categoryStatusColor === 'yellow' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(category.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h2>

          <TransactionForm budgetId={budgetId} categories={categories || []} />

          {!transactions || transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No transactions yet. Add your first expense below.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupTransactionsByDate(transactions)).map(([group, groupTransactions]) => {
                if (groupTransactions.length === 0) return null

                return (
                  <div key={group}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">{group}</h3>
                    <div className="space-y-3">
                      {groupTransactions.map(transaction => (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          budgetId={budgetId}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
