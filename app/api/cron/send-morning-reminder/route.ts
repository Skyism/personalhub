import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@/lib/supabase/server'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function GET(request: NextRequest) {
  // 1. Authorization: Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const providedSecret = authHeader?.replace('Bearer ', '')

  if (!providedSecret || providedSecret !== cronSecret) {
    console.error('Unauthorized cron request - invalid or missing CRON_SECRET')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Idempotency check: Check if we already sent today
  const today = new Date().toISOString().split('T')[0]
  const supabase = await createClient()

  const { data: existingLog } = await supabase
    .from('reminder_log')
    .select('id, status')
    .eq('date', today)
    .eq('type', 'morning')
    .maybeSingle()

  if (existingLog) {
    console.log('Morning reminder already sent today:', today, 'Status:', existingLog.status)
    return NextResponse.json({
      message: 'Already sent today',
      date: today,
      status: existingLog.status
    })
  }

  // 3. Fetch settings: Check if morning reminders are enabled
  const { data: settings, error: settingsError } = await supabase
    .from('skincare_settings')
    .select('morning_enabled, morning_message')
    .eq('user_id', TEMP_USER_ID)
    .maybeSingle()

  if (settingsError) {
    console.error('Failed to fetch skincare_settings:', settingsError)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }

  if (!settings) {
    console.error('No skincare_settings found for user:', TEMP_USER_ID)
    return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
  }

  if (!settings.morning_enabled) {
    console.log('Morning reminders disabled, skipping send')

    // Log as skipped
    await supabase.from('reminder_log').insert({
      date: today,
      type: 'morning',
      status: 'skipped',
      message_sid: null,
      error: null,
    })

    return NextResponse.json({
      message: 'Morning reminders disabled',
      date: today
    })
  }

  // 4. Send SMS: Use Twilio to send the message
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  const userPhone = process.env.USER_PHONE
  const twilioPhone = process.env.TWILIO_PHONE

  if (!twilioAccountSid || !twilioAuthToken || !userPhone || !twilioPhone) {
    console.error('Twilio credentials not configured')
    return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 })
  }

  try {
    const twilioClient = twilio(twilioAccountSid, twilioAuthToken)

    const message = await twilioClient.messages.create({
      to: userPhone,
      from: twilioPhone,
      body: settings.morning_message,
    })

    console.log('Morning reminder sent successfully:', {
      date: today,
      sid: message.sid,
      to: userPhone,
    })

    // 5. Log execution: Insert success into reminder_log
    await supabase.from('reminder_log').insert({
      date: today,
      type: 'morning',
      status: 'sent',
      message_sid: message.sid,
      error: null,
    })

    return NextResponse.json({
      success: true,
      date: today,
      sid: message.sid,
      message: 'Morning reminder sent successfully',
    })

  } catch (error) {
    // 6. Error handling: Log failure to database
    console.error('Failed to send morning reminder:', error)

    const errorMessage = String(error)

    await supabase.from('reminder_log').insert({
      date: today,
      type: 'morning',
      status: 'failed',
      message_sid: null,
      error: errorMessage,
    })

    return NextResponse.json(
      {
        error: 'Failed to send morning reminder',
        details: errorMessage,
        date: today,
      },
      { status: 500 }
    )
  }
}
