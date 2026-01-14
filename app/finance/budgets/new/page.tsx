'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBudget } from '../actions'

export default function NewBudgetPage() {
  const router = useRouter()
  const [month, setMonth] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const budgetAmount = parseFloat(totalBudget)

    if (isNaN(budgetAmount)) {
      setError('Please enter a valid budget amount.')
      setIsSubmitting(false)
      return
    }

    const result = await createBudget(month, budgetAmount)

    if (result.success) {
      router.push('/finance/budgets')
    } else {
      setError(result.error || 'Failed to create budget.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-6">
          <Link
            href="/finance/budgets"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            &larr; Back to Budgets
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Budget</h1>
          <p className="text-muted-foreground mb-6">Set up a new monthly budget</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-card-foreground mb-2">
                Month
              </label>
              <input
                type="month"
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                autoComplete="off"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted"
              />
            </div>

            <div>
              <label htmlFor="totalBudget" className="block text-sm font-medium text-card-foreground mb-2">
                Total Budget
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  id="totalBudget"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  inputMode="decimal"
                  autoComplete="off"
                  step="0.01"
                  min="0.01"
                  required
                  disabled={isSubmitting}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your total monthly budget in dollars
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Budget...' : 'Create Budget'}
              </button>
              <Link
                href="/finance/budgets"
                className="flex-1 bg-gray-200 text-card-foreground px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
