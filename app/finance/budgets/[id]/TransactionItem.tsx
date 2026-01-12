'use client'

import { useState } from 'react'
import { deleteTransaction } from '../transactions/actions'
import type { Tables } from '@/lib/database.types'

type TransactionWithCategory = Tables<'transactions'> & {
  categories: { name: string; color: string | null } | null
}

type TransactionItemProps = {
  transaction: TransactionWithCategory
  budgetId: number
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

export default function TransactionItem({ transaction, budgetId }: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
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
        <div className="text-right ml-4">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`text-sm font-medium transition-colors ${
            isDeleting
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-red-600 hover:text-red-700'
          }`}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 text-xs rounded">
          {error}
        </div>
      )}
    </div>
  )
}
