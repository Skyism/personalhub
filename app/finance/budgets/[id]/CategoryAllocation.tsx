'use client'

import { useState } from 'react'
import { setAllocation, removeAllocation } from '../category-allocations/actions'
import type { Tables } from '@/lib/database.types'

type Category = Tables<'categories'>
type CategoryAllocation = Tables<'category_allocations'> & {
  category?: Category
}

interface CategoryAllocationProps {
  budgetId: number
  categories: Category[]
  allocations: CategoryAllocation[]
  totalBudget: number
  isLoading?: boolean
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default function CategoryAllocation({
  budgetId,
  categories,
  allocations,
  totalBudget,
  isLoading = false,
}: CategoryAllocationProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_amount, 0)
  const availableAmount = totalBudget - totalAllocated

  const allocatedCategoryIds = new Set(allocations.map((a) => a.category_id))
  const availableCategories = categories.filter((c) => !allocatedCategoryIds.has(c.id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedCategoryId) {
      setError('Please select a category')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    const result = await setAllocation(budgetId, selectedCategoryId, amountNum)
    if (result.success) {
      setAmount('')
      setSelectedCategoryId(null)
      setIsAdding(false)
    } else {
      setError(result.error || 'Failed to set allocation')
    }
  }

  const handleRemove = async (categoryId: number) => {
    const result = await removeAllocation(budgetId, categoryId)
    if (!result.success) {
      alert(result.error || 'Failed to remove allocation')
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Category Allocations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(totalAllocated)} / {formatCurrency(totalBudget)} allocated
            {availableAmount > 0 && (
              <span className="text-green-600 ml-2">
                ({formatCurrency(availableAmount)} available)
              </span>
            )}
          </p>
        </div>
        {availableCategories.length > 0 && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            + Add Allocation
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-background rounded-lg p-4 mb-4 border border-border">
          <h3 className="font-medium text-foreground mb-3">Add Category Allocation</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-card-foreground mb-1">
                Category
              </label>
              <select
                id="category"
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-card-foreground mb-1">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false)
                  setSelectedCategoryId(null)
                  setAmount('')
                  setError('')
                }}
                className="flex-1 bg-gray-200 text-card-foreground px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {allocations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <p className="text-lg font-medium text-card-foreground mb-1">No category allocations yet</p>
          <p className="text-sm mt-2">
            {availableCategories.length > 0
              ? 'Click "Add Allocation" above to assign budget to categories.'
              : 'Create categories first at '}
            {availableCategories.length === 0 && (
              <a href="/finance/categories" className="text-blue-600 hover:underline font-medium">
                /finance/categories
              </a>
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allocations.map((allocation) => {
            const category = categories.find((c) => c.id === allocation.category_id)
            if (!category) return null

            return (
              <div
                key={allocation.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  />
                  <span className="font-medium text-foreground">{category.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(allocation.allocated_amount)}
                  </span>
                  <button
                    onClick={() => handleRemove(allocation.category_id)}
                    className="text-destructive hover:text-red-700 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
