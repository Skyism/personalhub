'use client'

import { useState } from 'react'
import { updateMorningSettings } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Database } from '@/lib/database.types'

type SkincareSettings = Database['public']['Tables']['skincare_settings']['Row']

interface MorningReminderFormProps {
  initialSettings: SkincareSettings | null
}

export default function MorningReminderForm({ initialSettings }: MorningReminderFormProps) {
  // Initialize state from initialSettings or defaults
  const [morningEnabled, setMorningEnabled] = useState(
    initialSettings?.morning_enabled ?? true
  )

  // Convert HH:MM:SS to HH:MM for time input
  const initialTime = initialSettings?.morning_time
    ? initialSettings.morning_time.substring(0, 5)
    : '08:00'

  const [morningTime, setMorningTime] = useState(initialTime)
  const [morningMessage, setMorningMessage] = useState(
    initialSettings?.morning_message ?? ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    setIsSubmitting(true)
    try {
      const result = await updateMorningSettings(morningEnabled, morningTime, morningMessage)
      if (result.success) {
        setSuccessMessage('Settings saved successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(result.error || 'Failed to update settings')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="morning-enabled"
          checked={morningEnabled}
          onChange={(e) => setMorningEnabled(e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        />
        <label
          htmlFor="morning-enabled"
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          Enable Morning Reminder
        </label>
      </div>

      <div>
        <label htmlFor="morning-time" className="block text-sm font-medium text-foreground mb-1">
          Morning Reminder Time
        </label>
        <Input
          id="morning-time"
          type="time"
          value={morningTime}
          onChange={(e) => setMorningTime(e.target.value)}
          disabled={!morningEnabled || isSubmitting}
          className="disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="morning-message" className="block text-sm font-medium text-foreground mb-1">
          Morning Message
        </label>
        <Textarea
          id="morning-message"
          value={morningMessage}
          onChange={(e) => setMorningMessage(e.target.value)}
          placeholder="e.g., Time for your morning skincare routine!"
          maxLength={160}
          disabled={!morningEnabled || isSubmitting}
          inputMode="text"
          autoComplete="off"
          className="disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {morningMessage.length}/160
        </p>
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
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  )
}
