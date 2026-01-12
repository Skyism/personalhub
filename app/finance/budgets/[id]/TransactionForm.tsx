'use client'

import { useState, FormEvent } from 'react'
import { createTransaction } from '../transactions/actions'
import type { Tables } from '@/lib/database.types'

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
        // Reset form and collapse
        setAmount('')
        setCategoryId('')
        setNote('')
        setDate(new Date().toISOString().split('T')[0])
        setErrors({})
        setIsExpanded(false)
        setMessage('Transaction added successfully!')

        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
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
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          Add Transaction
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add Transaction</h3>
        <button
          onClick={() => {
            setIsExpanded(false)
            setErrors({})
            setMessage(null)
          }}
          className="text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setErrors({ ...errors, amount: '' })
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
            required
            disabled={isSubmitting}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Category Dropdown */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category_id"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setErrors({ ...errors, date: '' })
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            required
            disabled={isSubmitting}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Note Textarea */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
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
            maxLength={500}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.note ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Add a note about this transaction..."
            disabled={isSubmitting}
          />
          {errors.note && (
            <p className="mt-1 text-sm text-red-600">{errors.note}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {note.length}/500 characters
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? 'Adding Transaction...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  )
}
