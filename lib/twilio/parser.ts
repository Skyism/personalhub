export interface ParsedSMS {
  amount: number | null
  note: string | null
}

/**
 * Parse SMS text to extract amount and note.
 * Expected format: "amount note"
 * Categories are assigned later in the UI, not via SMS.
 * Examples:
 *   "$25 coffee at starbucks" -> { amount: 25, note: "coffee at starbucks" }
 *   "25.50 trader joes" -> { amount: 25.50, note: "trader joes" }
 *   "100" -> { amount: 100, note: null }
 */
export function parseSMS(body: string): ParsedSMS {
  const trimmed = body.trim()

  // Extract amount: optional $, digits, optional .XX
  // Permissive regex to accept: $25, 25, 25.50, 25.5
  const amountMatch = trimmed.match(/\$?(\d+(?:\.\d{1,2})?)/)

  if (!amountMatch) {
    // No amount found
    return { amount: null, note: null }
  }

  const amount = parseFloat(amountMatch[1])

  // Extract remaining text after amount as note
  const remainingText = trimmed.replace(amountMatch[0], '').trim()

  const note = remainingText || null

  return { amount, note }
}
