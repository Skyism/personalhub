'use client'

import { useState, FormEvent, useRef } from 'react'
import { createTransaction } from '../transactions/actions'
import type { Tables } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Category = Tables<'categories'>

type TransactionFormProps = {
  budgetId: number
  categories: Category[]
}

export default function TransactionForm({ budgetId, categories }: TransactionFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => {
    // Default to today in YYYY-MM-DD format
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate amount
    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    // Validate date is not in the future
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate > today) {
      newErrors.date = 'Date cannot be in the future'
    }

    // Validate note length (optional field)
    if (note && note.length > 500) {
      newErrors.note = 'Note must be 500 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('amount', amount)
      formData.append('category_id', categoryId)
      formData.append('note', note)
      formData.append('date', date)

      const result = await createTransaction(formData, budgetId)

      if (result.success) {
        // Reset form
        setAmount('')
        setCategoryId('')
        setNote('')
        setDate(new Date().toISOString().split('T')[0])
        setErrors({})
        setMessage('Transaction added successfully!')

        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000)

        // Keep form expanded and refocus amount input for quick entry
        amountInputRef.current?.focus()
      } else {
        setErrors({ submit: result.error || 'Failed to create transaction' })
      }
    } catch (error) {
      console.error('Error submitting transaction:', error)
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isExpanded) {
    return (
      <div className="mb-6">
        {message && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-lg">
            {message}
          </div>
        )}
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          Add Transaction
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-6 bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-6 scroll-mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Add Transaction</h3>
        <button
          onClick={() => {
            setIsExpanded(false)
            setErrors({})
            setMessage(null)
          }}
          className="text-muted-foreground hover:text-foreground"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-1">
            Amount *
          </label>
          <Input
            ref={amountInputRef}
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0"
            inputMode="decimal"
            autoComplete="transaction-amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setErrors({ ...errors, amount: '' })
            }}
            className={errors.amount ? 'border-destructive' : ''}
            placeholder="0.00"
            required
            disabled={isSubmitting}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-destructive">{errors.amount}</p>
          )}
        </div>

        {/* Category Dropdown */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
            Category
          </label>
          <select
            id="category"
            name="category_id"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            autoComplete="off"
            className="w-full px-3 py-2 text-base border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted bg-background"
            disabled={isSubmitting}
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Input */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1">
            Date *
          </label>
          <Input
            type="date"
            id="date"
            name="date"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            autoComplete="bday"
            onChange={(e) => {
              setDate(e.target.value)
              setErrors({ ...errors, date: '' })
            }}
            className={errors.date ? 'border-destructive' : ''}
            required
            disabled={isSubmitting}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-destructive">{errors.date}</p>
          )}
        </div>

        {/* Note Textarea */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-foreground mb-1">
            Note (Optional)
          </label>
          <textarea
            id="note"
            name="note"
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              setErrors({ ...errors, note: '' })
            }}
            inputMode="text"
            autoComplete="off"
            maxLength={500}
            rows={3}
            className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted bg-background ${
              errors.note ? 'border-destructive' : 'border-input'
            }`}
            placeholder="Add a note about this transaction..."
            disabled={isSubmitting}
          />
          {errors.note && (
            <p className="mt-1 text-sm text-destructive">{errors.note}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {note.length}/500 characters
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Adding Transaction...' : 'Add Transaction'}
        </Button>
      </form>
    </div>
  )
}
