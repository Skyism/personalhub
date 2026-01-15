'use client'

import { useState } from 'react'
import { updateNightMessage, deleteNightMessage } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Database } from '@/lib/database.types'

type NightMessage = Database['public']['Tables']['night_messages']['Row']

interface NightMessageItemProps {
  message: NightMessage
}

export default function NightMessageItem({ message }: NightMessageItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMessage, setEditedMessage] = useState(message.message)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!editedMessage.trim()) {
      setError('Message cannot be empty')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const result = await updateNightMessage(message.id, editedMessage)
      if (result.success) {
        setIsEditing(false)
      } else {
        setError(result.error || 'Failed to update message')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) {
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const result = await deleteNightMessage(message.id)
      if (!result.success) {
        setError(result.error || 'Failed to delete message')
        setIsSubmitting(false)
      }
      // If successful, the component will be removed via revalidation
    } catch (err) {
      setError('Failed to delete message')
      setIsSubmitting(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-card rounded-lg shadow p-4 border border-border space-y-3">
        <div>
          <Textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            maxLength={160}
            disabled={isSubmitting}
            inputMode="text"
            autoComplete="off"
            className="disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {editedMessage.length}/160
          </p>
        </div>

        {error && (
          <div className="p-2 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !editedMessage.trim()}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false)
              setEditedMessage(message.message)
              setError(null)
            }}
            variant="secondary"
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg shadow p-4 border border-border">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground flex-1">{message.message}</p>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            className="text-xs h-7 px-2"
          >
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            className="text-xs h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
      {error && (
        <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
