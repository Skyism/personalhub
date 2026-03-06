'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isDropdownOpen])

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

  const handleCategorySelect = (categoryId: number | null) => {
    // Don't save if selecting the same category
    if (categoryId === transaction.category_id) {
      setIsDropdownOpen(false)
      return
    }

    setIsDropdownOpen(false)
    setError(null)

    startTransition(async () => {
      const result = await updateTransactionCategory(transaction.id, categoryId)

      if (!result.success) {
        setError(result.error || 'Failed to update category')
      }
    })
  }

  const toggleDropdown = () => {
    if (!isPending) {
      setIsDropdownOpen(!isDropdownOpen)
      setError(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group bg-muted border border-border rounded-lg p-4 transition-colors ${
        isDropdownOpen ? 'border-primary bg-primary/5' : 'hover:bg-muted/80'
      }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                disabled={isPending}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors border ${
                  isDropdownOpen
                    ? 'bg-primary/10 border-primary'
                    : 'border-transparent hover:border-border hover:bg-muted'
                } ${isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:bg-gray-200'}`}
                aria-label="Change category"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
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
                  <span className="text-muted-foreground">Uncategorized</span>
                )}
                {isPending ? (
                  <svg className="w-3 h-3 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg 
                    className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 z-50 bg-background border border-border rounded-lg shadow-lg min-w-[180px] max-h-[300px] overflow-y-auto"
                >
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                      transaction.category_id === null ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span>Uncategorized</span>
                    {transaction.category_id === null && (
                      <svg className="w-3 h-3 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                        transaction.category_id === category.id ? 'bg-primary/10' : 'text-foreground'
                      }`}
                      style={{
                        color: transaction.category_id === category.id 
                          ? (category.color || '#6B7280')
                          : undefined
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: category.color || '#9CA3AF'
                        }}
                      />
                      <span>{category.name}</span>
                      {transaction.category_id === category.id && (
                        <svg className="w-3 h-3 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-accent/20 text-accent-foreground">
              {transaction.source}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatTransactionDate(transaction.transaction_date)}
          </p>
          {transaction.note && (
            <p className="text-sm text-card-foreground mt-1">{transaction.note}</p>
          )}
        </div>
        <div className="text-right ml-4">
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>

      {!isDropdownOpen && (
        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded border ${
              isDeleting
                ? 'text-muted-foreground cursor-not-allowed border-border bg-muted'
                : 'text-destructive hover:text-destructive/80 border-destructive/30 hover:bg-destructive/10 active:bg-destructive/20'
            }`}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-destructive/10 text-destructive text-xs rounded">
          {error}
        </div>
      )}
    </motion.div>
  )
}
