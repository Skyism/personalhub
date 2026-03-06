import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import twilio from 'twilio'
import { parseSMS } from '@/lib/twilio/parser'
import { createClient } from '@/lib/supabase/server'
import { findOrCreateCurrentWantsBudget, createWantsTransaction, findActiveTrip, createTripTransaction } from '@/lib/wants/queries'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const webhookUrl = process.env.NEXT_PUBLIC_URL

  if (!authToken) {
    console.error('TWILIO_AUTH_TOKEN not configured')
    return new NextResponse('Server configuration error', { status: 500 })
  }

  if (!webhookUrl) {
    console.error('NEXT_PUBLIC_URL not configured')
    return new NextResponse('Server configuration error', { status: 500 })
  }

  // Extract Twilio signature header
  const signature = request.headers.get('x-twilio-signature')

  if (!signature) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Parse form-urlencoded body (Twilio sends this format)
  const body = await request.text()
  const params = Object.fromEntries(new URLSearchParams(body))

  // Validate webhook signature using Twilio SDK
  const url = `${webhookUrl}/api/sms`
  const isValid = twilio.validateRequest(authToken, signature, url, params)

  if (!isValid) {
    console.error('Invalid Twilio signature')
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Extract Twilio parameters
  const { MessageSid, From, Body: smsBody } = params

  const supabase = await createClient()

  // Check idempotency FIRST - prevent duplicate processing
  const { data: existingTransaction } = await supabase
    .from('transactions')
    .select('id')
    .eq('twilio_message_id', MessageSid)
    .maybeSingle()

  if (existingTransaction) {
    console.log('Duplicate SMS detected, already processed:', MessageSid)
    // Already processed, return success silently
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }

  // Parse SMS body to extract amount and note
  const parseResult = parseSMS(smsBody)

  if (!parseResult.amount) {
    // Could not parse amount - send error message back to user
    console.error('Failed to parse amount from SMS:', smsBody)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Could not parse amount. Format: "$25 coffee", "wants 25 coffee", or "trip 25 dinner"</Message></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }

  // Handle trip transactions
  if (parseResult.type === 'trip') {
    const { trip } = await findActiveTrip()

    if (!trip) {
      console.error('No active trip found')
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>No active trip. Create and activate one in the app first.</Message></Response>`
      return new NextResponse(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Check idempotency for wants_trip_transactions
    const { data: existingTrip } = await supabase
      .from('wants_trip_transactions')
      .select('id')
      .eq('twilio_message_id', MessageSid)
      .maybeSingle()

    if (existingTrip) {
      console.log('Duplicate trip SMS detected:', MessageSid)
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' }
        }
      )
    }

    // Create trip transaction
    await createTripTransaction({
      tripId: trip.id,
      wantsBudgetId: trip.wants_budget_id,
      amount: parseResult.amount,
      note: parseResult.note || null,
      twilioMessageId: MessageSid,
      twilioFrom: From,
    })

    console.log('Trip transaction created via SMS:', {
      MessageSid,
      tripId: trip.id,
      amount: parseResult.amount,
      note: parseResult.note,
    })

    // Return empty TwiML response (silent success)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }

  // Handle wants transactions
  if (parseResult.type === 'wants') {
    const { budget } = await findOrCreateCurrentWantsBudget()

    if (!budget) {
      // No wants budget configured for current period
      console.error('No wants budget found for current period')
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>No wants budget set up for current period. Visit app to configure.</Message></Response>`
      return new NextResponse(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Check idempotency for wants_transactions
    const { data: existingWants } = await supabase
      .from('wants_transactions')
      .select('id')
      .eq('twilio_message_id', MessageSid)
      .maybeSingle()

    if (existingWants) {
      console.log('Duplicate wants SMS detected:', MessageSid)
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' }
        }
      )
    }

    // Create wants transaction
    await createWantsTransaction({
      wantsBudgetId: budget.id,
      amount: parseResult.amount,
      note: parseResult.note || null,
      twilioMessageId: MessageSid,
      twilioFrom: From,
    })

    console.log('Wants transaction created via SMS:', {
      MessageSid,
      amount: parseResult.amount,
      note: parseResult.note,
    })

    // Return empty TwiML response (silent success)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }

  // Regular transaction flow continues below
  const { amount, note } = parseResult

  // Get current month in YYYY-MM format
  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

  // Try to get budget for current month
  let { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', TEMP_USER_ID)
    .eq('month', currentMonth)  // Match exact month
    .maybeSingle()

  // If no budget exists for current month, create one
  if (!budget && !budgetError) {
    const { data: newBudget, error: createError } = await supabase
      .from('budgets')
      .insert({
        user_id: TEMP_USER_ID,
        month: currentMonth,
        total_budget: 0,  // Default to $0, user can update later
      })
      .select('id')
      .single()

    if (createError) {
      console.error('Error creating budget:', createError)
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error creating budget for ${currentMonth}. Please try again.</Message></Response>`,
        { headers: { 'Content-Type': 'text/xml' } }
      )
    }

    budget = newBudget
    budgetError = null
  }

  if (budgetError) {
    console.error('Error fetching/creating budget:', budgetError)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error accessing budget. Please try again.</Message></Response>`,
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  // At this point, budget should always exist (either found or created)
  if (!budget) {
    console.error('Budget is null after fetch/create attempt')
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Unable to access budget. Please try again.</Message></Response>`,
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  // Create uncategorized transaction (category assigned later in UI)
  const { error: insertError } = await supabase.from('transactions').insert({
    user_id: TEMP_USER_ID,
    budget_id: budget.id,
    category_id: null, // Categories assigned later in UI
    amount,
    note,
    transaction_date: new Date().toISOString(),
    source: 'sms',
    twilio_message_id: MessageSid,
    twilio_from: From,
  })

  if (insertError) {
    console.error('Failed to create transaction:', insertError)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Failed to log expense. Please try again.</Message></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }

  console.log('Transaction created successfully:', {
    MessageSid,
    amount,
    note,
  })

  // Revalidate the budget detail page to refresh UI
  revalidatePath(`/finance/budgets/${budget.id}`)

  // Return empty TwiML response (silent success - no SMS reply)
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}
