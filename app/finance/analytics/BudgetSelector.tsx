'use client'

import { useRouter } from 'next/navigation'
import type { Tables } from '@/lib/database.types'

type Budget = Tables<'budgets'>

type BudgetSelectorProps = {
  budgets: Budget[]
  selectedBudgetId: number
}

function formatMonth(monthString: string): string {
  const date = new Date(monthString + '-01')
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function BudgetSelector({ budgets, selectedBudgetId }: BudgetSelectorProps) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBudgetId = e.target.value
    router.push(`/finance/analytics?budget_id=${newBudgetId}`)
  }

  return (
    <div className="relative">
      <select
        value={selectedBudgetId}
        onChange={handleChange}
        className="appearance-none w-full px-4 py-3 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card text-foreground text-base cursor-pointer"
      >
        {budgets.map(budget => (
          <option key={budget.id} value={budget.id}>
            {formatMonth(budget.month)}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
