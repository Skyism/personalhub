'use client'

import { useState } from 'react'
import { createCategory } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        + Create Category
      </Button>
    )
  }

  return (
    <div className="bg-muted/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Create New Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
            Category Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputMode="text"
            autoComplete="off"
            placeholder="e.g., Food, Transport, Entertainment"
            autoFocus
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
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
                  color === option.value ? 'ring-2 ring-offset-2 ring-foreground' : ''
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
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Creating Category...' : 'Create'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsOpen(false)
              setName('')
              setColor('#3B82F6')
              setError('')
            }}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
