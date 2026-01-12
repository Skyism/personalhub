import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'

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

export default async function BudgetsPage() {
  const supabase = await createClient()

  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', TEMP_USER_ID)
    .order('month', { ascending: false })

  if (error) {
    console.error('Error fetching budgets:', error)
  }

  const hasBudgets = budgets && budgets.length > 0

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
            <p className="text-gray-600 mt-1">Manage your monthly budgets</p>
          </div>
          <Link
            href="/finance/budgets/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Budget
          </Link>
        </div>

        {!hasBudgets ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No budgets yet
              </h2>
              <p className="text-gray-600 mb-6">
                Get started by creating your first budget to track your monthly spending.
              </p>
              <Link
                href="/finance/budgets/new"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Budget
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {budgets.map((budget) => (
              <Link
                key={budget.id}
                href={`/finance/budgets/${budget.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {formatMonth(budget.month)}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Created {new Date(budget.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(budget.total_budget)}
                    </p>
                    <p className="text-gray-600 text-sm">Total Budget</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
