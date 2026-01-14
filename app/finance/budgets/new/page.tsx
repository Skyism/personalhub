'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBudget } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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
            className="text-primary hover:text-primary/80 font-medium"
          >
            &larr; Back to Budgets
          </Link>
        </div>

        <Card className="bg-muted/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-3xl">Create Budget</CardTitle>
            <p className="text-muted-foreground">Set up a new monthly budget</p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-foreground mb-2">
                  Month
                </label>
                <Input
                  type="month"
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  autoComplete="off"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="totalBudget" className="block text-sm font-medium text-foreground mb-2">
                  Total Budget
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
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
                    className="pl-8"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your total monthly budget in dollars
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating Budget...' : 'Create Budget'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  asChild
                  className="flex-1"
                >
                  <Link href="/finance/budgets">
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
