import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import twilio from 'twilio'
import { parseSMS } from '@/lib/twilio/parser'
import { matchCategoryToId } from '@/lib/twilio/categories'
import { createClient } from '@/lib/supabase/server'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!authToken) {
    console.error('TWILIO_AUTH_TOKEN not configured')
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
  const url = `${process.env.NEXT_PUBLIC_URL}/api/sms`
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

  // Parse SMS body to extract amount, category, note
  const { amount, category, note } = parseSMS(smsBody)

  if (!amount) {
    // Could not parse amount - send error message back to user
    console.error('Failed to parse amount from SMS:', smsBody)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Could not parse amount. Format: "$25 coffee lunch with team"</Message></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }

  // Match category string to category_id (null if no match)
  const categoryId = await matchCategoryToId(category, TEMP_USER_ID)

  // Get most recent budget for this user
  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', TEMP_USER_ID)
    .order('month', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (budgetError || !budget) {
    console.error('No budget found for user:', TEMP_USER_ID)
    // No budget exists - send error message back to user
    const appUrl = process.env.NEXT_PUBLIC_URL || 'your app'
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>No budget found. Create a budget first at ${appUrl}</Message></Response>`,
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }

  // Create transaction with Twilio tracking fields
  const { error: insertError } = await supabase.from('transactions').insert({
    user_id: TEMP_USER_ID,
    budget_id: budget.id,
    category_id: categoryId,
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
    category: categoryId,
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
