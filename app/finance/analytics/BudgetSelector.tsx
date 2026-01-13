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
    <select
      value={selectedBudgetId}
      onChange={handleChange}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
    >
      {budgets.map(budget => (
        <option key={budget.id} value={budget.id}>
          {formatMonth(budget.month)}
        </option>
      ))}
    </select>
  )
}
