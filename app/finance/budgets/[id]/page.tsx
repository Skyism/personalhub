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
      </div>
    </div>
  )
}
