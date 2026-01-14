'use client'

import { useState } from 'react'
import { createCategory } from './actions'

const COLOR_OPTIONS = [
  { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
  { value: '#F59E0B', label: 'Orange', class: 'bg-orange-500' },
  { value: '#EAB308', label: 'Yellow', class: 'bg-yellow-500' },
  { value: '#10B981', label: 'Green', class: 'bg-green-500' },
  { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
  { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
  { value: '#6B7280', label: 'Gray', class: 'bg-background0' },
]

export default function CreateCategoryForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Category name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createCategory(name, color)
      if (result.success) {
        setName('')
        setColor('#3B82F6')
        setIsOpen(false)
      } else {
        setError(result.error || 'Failed to create category')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
      >
        + Create Category
      </button>
    )
  }

  return (
    <div className="bg-card rounded-lg shadow p-6 border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Create New Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-1">
            Category Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputMode="text"
            autoComplete="off"
            placeholder="e.g., Food, Transport, Entertainment"
            className="w-full px-3 py-2 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted"
            autoFocus
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                disabled={isSubmitting}
                className={`h-10 rounded-lg ${option.class} ${
                  color === option.value ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                } disabled:opacity-60 disabled:cursor-not-allowed`}
                title={option.label}
              />
            ))}
          </div>
        </div>
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Category...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setName('')
              setColor('#3B82F6')
              setError('')
            }}
            disabled={isSubmitting}
            className="flex-1 bg-gray-200 text-card-foreground px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
