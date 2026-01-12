import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

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
  const { MessageSid, From, Body } = params

  console.log('Received SMS:', { MessageSid, From, Body })

  // Return empty TwiML response (silent success)
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}
