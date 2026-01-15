'use client'

import { useState } from 'react'
import { updateNightSettings, createNightMessage } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NightMessageItem from './NightMessageItem'
import type { Database } from '@/lib/database.types'

type SkincareSettings = Database['public']['Tables']['skincare_settings']['Row']
type NightMessage = Database['public']['Tables']['night_messages']['Row']

interface NightReminderFormProps {
  initialSettings: SkincareSettings | null
  nightMessages: NightMessage[]
}

export default function NightReminderForm({ initialSettings, nightMessages }: NightReminderFormProps) {
  // Initialize state from initialSettings or defaults
  const [nightEnabled, setNightEnabled] = useState(
    initialSettings?.night_enabled ?? true
  )

  // Convert HH:MM:SS to HH:MM for time input
  const initialTime = initialSettings?.night_time
    ? initialSettings.night_time.substring(0, 5)
    : '22:30'

  const [nightTime, setNightTime] = useState(initialTime)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    setIsSubmitting(true)
    try {
      const result = await updateNightSettings(nightEnabled, nightTime)
      if (result.success) {
        setSuccessMessage('Night settings saved successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(result.error || 'Failed to update night settings')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddMessage = async () => {
    if (!newMessage.trim()) {
      setError('Message cannot be empty')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const result = await createNightMessage(newMessage)
      if (result.success) {
        setNewMessage('')
        setShowAddForm(false)
        setSuccessMessage('Message added successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(result.error || 'Failed to add message')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-muted/50 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle>Night Reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Night Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="night-enabled"
              checked={nightEnabled}
              onChange={(e) => setNightEnabled(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
            <label
              htmlFor="night-enabled"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Enable Night Reminder
            </label>
          </div>

          <div>
            <label htmlFor="night-time" className="block text-sm font-medium text-foreground mb-1">
              Night Reminder Time
            </label>
            <Input
              id="night-time"
              type="time"
              value={nightTime}
              onChange={(e) => setNightTime(e.target.value)}
              disabled={!nightEnabled || isSubmitting}
              className="disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-md bg-green-500/10 border border-green-500 text-green-700 dark:text-green-400 text-sm">
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Update Night Settings'}
          </Button>
        </form>

        {/* Night Messages Section */}
        <div className="border-t border-border pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">Night Messages</h3>
            <p className="text-sm text-muted-foreground">
              Add multiple messages that will rotate each night
            </p>
          </div>

          {/* Message List */}
          {nightMessages.length === 0 ? (
            <div className="p-4 bg-muted/30 rounded-lg text-center text-muted-foreground text-sm">
              No night messages yet. Add one to get started!
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {nightMessages.map((message) => (
                <NightMessageItem key={message.id} message={message} />
              ))}
            </div>
          )}

          {/* Add Message Form */}
          {nightEnabled && (
            <>
              {!showAddForm ? (
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="secondary"
                  className="w-full"
                >
                  + Add Night Message
                </Button>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div>
                    <label htmlFor="new-message" className="block text-sm font-medium text-foreground mb-1">
                      New Night Message
                    </label>
                    <Textarea
                      id="new-message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="e.g., Don't forget your night skincare routine!"
                      maxLength={160}
                      disabled={isSubmitting}
                      inputMode="text"
                      autoComplete="off"
                      className="disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {newMessage.length}/160
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddMessage}
                      disabled={isSubmitting || !newMessage.trim()}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Message'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddForm(false)
                        setNewMessage('')
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
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
