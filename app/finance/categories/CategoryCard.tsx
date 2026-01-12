'use client'

import { useState } from 'react'
import { updateCategory, deleteCategory } from './actions'
import type { Tables } from '@/lib/database.types'

type Category = Tables<'categories'>

interface CategoryCardProps {
  category: Category
}

const COLOR_OPTIONS = [
  { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
  { value: '#F59E0B', label: 'Orange', class: 'bg-orange-500' },
  { value: '#EAB308', label: 'Yellow', class: 'bg-yellow-500' },
  { value: '#10B981', label: 'Green', class: 'bg-green-500' },
  { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
  { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
  { value: '#6B7280', label: 'Gray', class: 'bg-gray-500' },
]

export default function CategoryCard({ category }: CategoryCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [name, setName] = useState(category.name)
  const [color, setColor] = useState(category.color || '#3B82F6')
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')
    const result = await updateCategory(category.id, name, color)
    if (result.success) {
      setIsEditing(false)
    } else {
      setError(result.error || 'Failed to update category')
    }
  }

  const handleDelete = async () => {
    setError('')
    const result = await deleteCategory(category.id)
    if (!result.success) {
      setError(result.error || 'Failed to delete category')
      setIsDeleting(false)
    }
  }

  if (isDeleting) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <p className="text-gray-900 font-medium mb-4">
          Delete "{category.name}"?
        </p>
        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
          <button
            onClick={() => setIsDeleting(false)}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setColor(option.value)}
                  className={`h-10 rounded-lg ${option.class} ${
                    color === option.value ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                  }`}
                  title={option.label}
                />
              ))}
            </div>
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setName(category.name)
                setColor(category.color || '#3B82F6')
                setError('')
              }}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: category.color || '#3B82F6' }}
          />
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
