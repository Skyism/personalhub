'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function updateMorningSettings(
  enabled: boolean,
  time: string,
  message: string
) {
  // Validation
  if (message.length > 160) {
    return { success: false, error: 'Message must be 160 characters or less' }
  }

  const timeRegex = /^\d{2}:\d{2}$/
  if (!timeRegex.test(time)) {
    return { success: false, error: 'Invalid time format. Expected HH:MM' }
  }

  // Convert HH:MM to HH:MM:SS for database
  const timeWithSeconds = `${time}:00`

  const supabase = await createClient()

  // Query existing settings
  const { data: existingSettings } = await supabase
    .from('skincare_settings')
    .select('*')
    .eq('user_id', TEMP_USER_ID)
    .maybeSingle()

  let error

  if (existingSettings) {
    // Update existing settings
    const result = await supabase
      .from('skincare_settings')
      .update({
        morning_enabled: enabled,
        morning_time: timeWithSeconds,
        morning_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', TEMP_USER_ID)

    error = result.error
  } else {
    // Insert new settings
    const result = await supabase
      .from('skincare_settings')
      .insert({
        user_id: TEMP_USER_ID,
        morning_enabled: enabled,
        morning_time: timeWithSeconds,
        morning_message: message,
      })

    error = result.error
  }

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/skincare/settings')
  return { success: true }
}
