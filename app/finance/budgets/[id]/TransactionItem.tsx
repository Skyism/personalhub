'use client'

import { useState, useTransition } from 'react'
import { deleteTransaction, updateTransactionCategory } from '../transactions/actions'
import type { Tables } from '@/lib/database.types'

type TransactionWithCategory = Tables<'transactions'> & {
  categories: { name: string; color: string | null } | null
}

type TransactionItemProps = {
  transaction: TransactionWithCategory
  budgetId: number
  categories: Tables<'categories'>[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatTransactionDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TransactionItem({ transaction, budgetId, categories }: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(transaction.category_id)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteTransaction(transaction.id, budgetId)

      if (!result.success) {
        setError(result.error || 'Failed to delete transaction')
        setIsDeleting(false)
      }
      // If successful, the page will revalidate and this component will unmount
    } catch (err) {
      console.error('Error deleting transaction:', err)
      setError('An unexpected error occurred')
      setIsDeleting(false)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSelectedCategory(transaction.category_id)
    setError(null)
  }

  const handleSaveCategory = () => {
    startTransition(async () => {
      const result = await updateTransactionCategory(transaction.id, selectedCategory)

      if (result.success) {
        setIsEditing(false)
        setError(null)
      } else {
        setError(result.error || 'Failed to update category')
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveCategory()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEdit()
    }
  }

  return (
    <div className={`group border rounded-lg p-4 transition-colors ${
      isEditing ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory === null ? '' : selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value === '' ? null : parseInt(e.target.value))}
                  onKeyDown={handleKeyDown}
                  className="px-2 py-1 rounded text-xs font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isPending}
                  autoFocus
                  aria-label="Select category"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSaveCategory}
                  disabled={isPending}
                  className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isPending}
                  className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-gray-900 disabled:text-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors hover:bg-gray-100 border border-transparent hover:border-gray-300 active:bg-gray-200"
                  aria-label="Edit category"
                >
                  {transaction.categories ? (
                    <span
                      className="flex items-center gap-1"
                      style={{
                        color: transaction.categories.color || '#6B7280'
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: transaction.categories.color || '#9CA3AF'
                        }}
                      />
                      {transaction.categories.name}
                    </span>
                  ) : (
                    <span className="text-gray-600">Uncategorized</span>
                  )}
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </>
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
        <div className="text-right ml-4">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>

      {!isEditing && (
        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded border ${
              isDeleting
                ? 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-100'
                : 'text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 active:bg-red-100'
            }`}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 text-xs rounded">
          {error}
        </div>
      )}
    </div>
  )
}
