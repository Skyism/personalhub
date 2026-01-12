export interface ParsedSMS {
  amount: number | null
  category: string | null
  note: string | null
}

/**
 * Parse SMS text to extract amount, category, and note.
 * Expected format: "amount category note"
 * Examples:
 *   "$25 coffee" -> { amount: 25, category: "coffee", note: null }
 *   "25.50 groceries trader joes" -> { amount: 25.50, category: "groceries", note: "trader joes" }
 *   "100" -> { amount: 100, category: null, note: null }
 */
export function parseSMS(body: string): ParsedSMS {
  const trimmed = body.trim()

  // Extract amount: optional $, digits, optional .XX
  // Permissive regex to accept: $25, 25, 25.50, 25.5
  const amountMatch = trimmed.match(/\$?(\d+(?:\.\d{1,2})?)/)

  if (!amountMatch) {
    // No amount found
    return { amount: null, category: null, note: null }
  }

  const amount = parseFloat(amountMatch[1])

  // Extract remaining text after amount
  const remainingText = trimmed.replace(amountMatch[0], '').trim()

  if (!remainingText) {
    // Just amount, no category or note
    return { amount, category: null, note: null }
  }

  // Split remaining text by whitespace
  // First word is category, rest is note
  const words = remainingText.split(/\s+/)
  const category = words[0] || null
  const note = words.slice(1).join(' ') || null

  return { amount, category, note }
}
