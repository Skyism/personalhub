export interface ParsedSMS {
  type?: 'regular' | 'wants'
  amount: number | null
  note: string | null
}

/**
 * Parse SMS text to extract amount and note.
 * Expected formats:
 *   - Regular: "amount note" -> { type: 'regular', amount: 25, note: "groceries" }
 *   - Wants: "wants amount note" -> { type: 'wants', amount: 25, note: "coffee" }
 * Categories are assigned later in the UI, not via SMS.
 * Examples:
 *   "$25 coffee at starbucks" -> { type: 'regular', amount: 25, note: "coffee at starbucks" }
 *   "wants 25 coffee" -> { type: 'wants', amount: 25, note: "coffee" }
 *   "want 30.50 lunch out" -> { type: 'wants', amount: 30.50, note: "lunch out" }
 *   "25.50 trader joes" -> { type: 'regular', amount: 25.50, note: "trader joes" }
 *   "100" -> { type: 'regular', amount: 100, note: null }
 */
export function parseSMS(body: string): ParsedSMS {
  const trimmed = body.trim()

  // Check if this is a wants transaction (starts with "wants" or "want")
  const wantsMatch = trimmed.match(/^(wants?)\s+/i)
  let type: 'regular' | 'wants' = 'regular'
  let textToParse = trimmed

  if (wantsMatch) {
    type = 'wants'
    // Strip the "wants" or "want" prefix
    textToParse = trimmed.substring(wantsMatch[0].length).trim()
  }

  // Extract amount: optional $, digits, optional .XX
  // Permissive regex to accept: $25, 25, 25.50, 25.5
  const amountMatch = textToParse.match(/\$?(\d+(?:\.\d{1,2})?)/)

  if (!amountMatch) {
    // No amount found
    return { type, amount: null, note: null }
  }

  const amount = parseFloat(amountMatch[1])

  // Extract remaining text after amount as note
  const remainingText = textToParse.replace(amountMatch[0], '').trim()

  const note = remainingText || null

  return { type, amount, note }
}
