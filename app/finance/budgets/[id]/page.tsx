import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'
import CategoryAllocation from './CategoryAllocation'

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

function formatTransactionDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h2>

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
                        <div
                          key={transaction.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {transaction.categories ? (
                                  <span
                                    className="px-2 py-1 rounded text-xs font-medium"
                                    style={{
                                      backgroundColor: transaction.categories.color ? `${transaction.categories.color}20` : '#E5E7EB',
                                      color: transaction.categories.color || '#6B7280'
                                    }}
                                  >
                                    {transaction.categories.name}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">
                                    Uncategorized
                                  </span>
                                )}
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                  {transaction.source}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {formatTransactionDate(transaction.transaction_date)}
                              </p>
                              {transaction.note && (
                                <p className="text-sm text-gray-700 mt-1">{transaction.note}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(transaction.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
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
