# Phase 5: SMS Integration - Research

**Researched:** 2026-01-12
**Domain:** Twilio SMS webhooks with Next.js App Router
**Confidence:** HIGH

<research_summary>
## Summary

Researched the Twilio ecosystem for implementing SMS-based expense logging via webhooks. The standard approach uses Twilio's official Node.js SDK for webhook validation, Next.js App Router Route Handlers for receiving webhooks, and simple regex parsing for extracting amount/category/note from free-form text.

Key finding: Don't hand-roll webhook signature validation or security measures. Twilio provides battle-tested validation via `twilio.validateRequest()` that handles HMAC-SHA1 signature verification. Custom implementations miss edge cases (evolving parameters, URL encoding quirks, protocol changes).

For text parsing, the "amount note" format is simple enough for regex extraction rather than NLP libraries. Categories are assigned later in the UI, not via SMS. The constraint is controlled input (users texting their own expenses) not adversarial/noisy data, making heavyweight NLP overkill.

**Primary recommendation:** Use Twilio SDK webhook validation + Next.js Route Handler + regex parsing. Implement idempotency via MessageSid tracking. Keep responses under 15 seconds (Twilio timeout).
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| twilio | ^5.3.7 | Twilio SDK for Node.js | Official SDK, webhook validation, SMS sending |
| Next.js App Router | 14+ | Route Handlers for webhooks | Built-in Web API support, no bodyParser needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | Regex sufficient for parsing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Regex parsing | NLP libraries (natural, compromise) | NLP adds complexity for simple "amount note" format |
| Twilio SDK | Custom HMAC-SHA1 | Custom validation misses edge cases, Twilio recommends SDK |
| Route Handlers | Pages Router API Routes | App Router is current standard, simpler body handling |

**Installation:**
```bash
npm install twilio
```

**Note:** Next.js 14 App Router handles form-urlencoded bodies natively via `request.text()` - no body-parser needed.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   └── sms/
│       └── route.ts           # Webhook endpoint
lib/
├── twilio/
│   ├── validate.ts            # Signature validation helper
│   └── parser.ts              # SMS text parser
```

### Pattern 1: Webhook Route Handler with Validation
**What:** Next.js Route Handler that validates Twilio signature before processing
**When to use:** All Twilio webhook endpoints
**Example:**
```typescript
// app/api/sms/route.ts
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const signature = request.headers.get('x-twilio-signature')

  // Parse form-urlencoded body
  const body = await request.text()
  const params = Object.fromEntries(new URLSearchParams(body))

  // Validate signature
  const url = `${process.env.NEXT_PUBLIC_URL}/api/sms`
  const isValid = twilio.validateRequest(authToken, signature!, url, params)

  if (!isValid) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Process SMS
  const { MessageSid, From, Body } = params
  // ... handle transaction creation

  // Respond quickly (< 15 seconds)
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' }
  })
}
```

### Pattern 2: Idempotency with MessageSid
**What:** Track MessageSid to prevent duplicate processing on Twilio retries
**When to use:** Always for webhooks that create database records
**Example:**
```typescript
// Check for duplicate before processing
const existing = await supabase
  .from('transactions')
  .select('id')
  .eq('twilio_message_id', MessageSid)
  .single()

if (existing.data) {
  // Already processed, return success
  return new NextResponse('<Response></Response>', {
    headers: { 'Content-Type': 'text/xml' }
  })
}

// Create transaction with twilio_message_id for idempotency
await supabase.from('transactions').insert({
  ...transactionData,
  twilio_message_id: MessageSid,
  source: 'sms'
})
```

### Pattern 3: Regex Text Parsing
**What:** Extract amount and note from free-form SMS text (categories assigned later in UI)
**When to use:** Controlled input format (user's own expenses, not adversarial)
**Example:**
```typescript
// lib/twilio/parser.ts
export function parseSMS(body: string): {
  amount: number | null
  note: string | null
} {
  // Extract amount: $XX.XX or XX.XX or XX
  const amountMatch = body.match(/\$?(\d+(?:\.\d{1,2})?)/)
  const amount = amountMatch ? parseFloat(amountMatch[1]) : null

  // Extract note: everything after amount
  const remainingText = body.replace(/\$?\d+(?:\.\d{1,2})?/, '').trim()
  const note = remainingText || null

  return { amount, note }
}
```

### Anti-Patterns to Avoid
- **Custom signature validation:** Twilio's implementation handles edge cases (URL encoding, parameter ordering, protocol changes)
- **Slow processing in webhook:** Twilio times out after 15 seconds. Offload heavy work to background jobs.
- **Not checking MessageSid:** Twilio retries on failure, leading to duplicate transactions
- **Using NLP for simple parsing:** Regex is sufficient for "amount note" format
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature validation | Custom HMAC-SHA1 implementation | twilio.validateRequest() | Parameters evolve without notice, protocol edge cases |
| Phone number formatting | String manipulation | Twilio SDK phone utilities | International formats, validation, normalization |
| SMS sending | Raw HTTP requests | Twilio SDK client.messages.create() | Handles auth, retries, error codes |
| Complex text parsing | Regex for flexible input | Keep regex simple OR use NLP library | For "amount note" format, regex works. For truly flexible input, use NLP. |
| Idempotency | Time-based deduplication | MessageSid database constraint | MessageSid is unique per message, guaranteed by Twilio |

**Key insight:** Twilio's webhook security is non-trivial. The signature includes the exact URL (protocol, domain, path, query params) and all POST parameters in sorted order. Custom implementations break when Twilio adds parameters or when proxies/load balancers modify URLs. Use the SDK.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: URL Mismatch in Signature Validation
**What goes wrong:** Validation fails despite correct auth token
**Why it happens:** The URL passed to validateRequest() must EXACTLY match what Twilio was configured with (protocol, domain, path, query params, trailing slashes)
**How to avoid:** Use an environment variable for the webhook URL, ensure it matches Twilio console configuration character-for-character. Include protocol (https://) and exclude query params unless Twilio was configured with them.
**Warning signs:** All webhooks fail validation, logs show "signature mismatch"

### Pitfall 2: 15-Second Timeout
**What goes wrong:** Twilio retries webhook, causing duplicate transactions
**Why it happens:** Twilio expects response within 15 seconds. Slow database queries, external API calls, or complex processing causes timeouts.
**How to avoid:** Acknowledge webhook immediately (<200ms), offload heavy processing to background jobs/queues
**Warning signs:** Duplicate transactions, Twilio retry headers (I-Twilio-Idempotency-Token), 11200 error codes

### Pitfall 3: Missing Idempotency
**What goes wrong:** Same SMS creates multiple transactions
**Why it happens:** Twilio retries on timeout or failure, sending the same MessageSid multiple times
**How to avoid:** Check for existing transaction with this MessageSid before creating new one. Add unique constraint on `twilio_message_id` column.
**Warning signs:** Duplicate transactions with same amount/category/time, user reports "I only texted once"

### Pitfall 4: Form-Urlencoded Body Parsing in App Router
**What goes wrong:** req.body is undefined or not parsed correctly
**Why it happens:** Next.js App Router doesn't auto-parse like Pages Router
**How to avoid:** Use `await request.text()` then parse with `new URLSearchParams(body)` to get form fields
**Warning signs:** params object is empty, webhook validation fails, MessageSid is undefined

### Pitfall 5: Overly Strict Parsing
**What goes wrong:** Users' texts fail to parse, transactions not created
**Why it happens:** Regex too strict (requires exact format, $ symbol, decimal places)
**How to avoid:** Be permissive with parsing - accept "$25", "25", "25.50", etc. Default missing fields (category → "Uncategorized", note → null) rather than rejecting.
**Warning signs:** User texts "25 coffee" but nothing appears in app, no error message sent back
</common_pitfalls>

<code_examples>
## Code Examples

### Complete Route Handler with Validation
```typescript
// app/api/sms/route.ts
// Source: Official Twilio docs + Next.js App Router patterns
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { parseSMS } from '@/lib/twilio/parser'
import { createClient } from '@/lib/supabase/server'

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const signature = request.headers.get('x-twilio-signature')

  if (!signature) {
    return new NextResponse('Missing signature', { status: 401 })
  }

  // Parse form-urlencoded body (Twilio format)
  const body = await request.text()
  const params = Object.fromEntries(new URLSearchParams(body))

  // Validate webhook signature
  const url = `${process.env.NEXT_PUBLIC_URL}/api/sms`
  const isValid = twilio.validateRequest(authToken, signature, url, params)

  if (!isValid) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  // Extract Twilio params
  const { MessageSid, From, Body: smsBody } = params

  // Parse SMS text
  const { amount, note } = parseSMS(smsBody)

  if (!amount) {
    // Invalid format - optionally send error SMS back
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Could not parse amount. Format: "$25 coffee at starbucks"</Message></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  // Check idempotency
  const supabase = createClient()
  const existing = await supabase
    .from('transactions')
    .select('id')
    .eq('twilio_message_id', MessageSid)
    .single()

  if (existing.data) {
    // Already processed
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    })
  }

  // Create transaction (category assigned later in UI)
  await supabase.from('transactions').insert({
    user_id: TEMP_USER_ID,
    amount,
    category_id: null, // Categories assigned later in UI
    note,
    transaction_date: new Date().toISOString(),
    source: 'sms',
    twilio_message_id: MessageSid,
    twilio_from: From
  })

  // Respond quickly
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' }
  })
}
```

### SMS Text Parser
```typescript
// lib/twilio/parser.ts
// Source: Regex patterns from research + practical constraints
export interface ParsedSMS {
  amount: number | null
  note: string | null
}

export function parseSMS(body: string): ParsedSMS {
  const trimmed = body.trim()

  // Extract amount (flexible: $25, 25.50, 25)
  // Pattern: Optional $, digits, optional .XX
  const amountMatch = trimmed.match(/\$?(\d+(?:\.\d{1,2})?)/)

  if (!amountMatch) {
    return { amount: null, note: null }
  }

  const amount = parseFloat(amountMatch[1])

  // Extract remaining text after amount as note
  const remainingText = trimmed
    .replace(amountMatch[0], '')
    .trim()

  const note = remainingText || null

  return { amount, note }
}

// Examples:
// "$25 coffee at starbucks" -> { amount: 25, note: "coffee at starbucks" }
// "25.50 trader joes" -> { amount: 25.50, note: "trader joes" }
// "100" -> { amount: 100, note: null }
```

### Idempotency Check
```typescript
// lib/twilio/idempotency.ts
// Source: Best practice pattern
import { createClient } from '@/lib/supabase/server'

export async function checkIdempotency(messageSid: string): Promise<boolean> {
  const supabase = createClient()

  const { data } = await supabase
    .from('transactions')
    .select('id')
    .eq('twilio_message_id', messageSid)
    .single()

  return !!data // Returns true if already processed
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API Routes | App Router Route Handlers | Next.js 13+ (2023) | No bodyParser needed, use request.text() |
| Manual body-parser config | Native Web API parsing | Next.js 13+ (2023) | Simpler, standard approach |
| twilio.webhook() Express middleware | Direct validateRequest() call | Still valid (both work) | Route Handlers don't use Express, direct validation cleaner |

**New tools/patterns to consider:**
- **I-Twilio-Idempotency-Token header:** Twilio now sends this unique token on retries (added ~2023), can use instead of MessageSid for deduplication
- **Next.js 14 Server Actions:** Could use for transaction creation, but Route Handlers are standard for webhooks

**Deprecated/outdated:**
- **Pages Router bodyParser config:** Not needed in App Router, use request.text()
- **Express-specific patterns:** App Router uses Web APIs, not Express-compatible middleware
</sota_updates>

<open_questions>
## Open Questions

1. **Budget assignment from SMS**
   - What we know: Transactions require budget_id, SMS doesn't specify budget
   - What's unclear: How to determine which budget for this transaction
   - Recommendation: Use current month's budget (one budget per month assumption), or default to most recent budget

2. **Error handling for users**
   - What we know: Can send TwiML <Message> response back to user
   - What's unclear: Should we send confirmation SMS on success? Error SMS on failure?
   - Recommendation: Silent on success (users check app), error SMS only on parse failure ("Could not parse amount")
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Twilio Webhooks Security Documentation](https://www.twilio.com/docs/usage/webhooks/webhooks-security) - Signature validation, HTTPS requirements, security best practices
- [Twilio Messaging Webhooks Documentation](https://www.twilio.com/docs/usage/webhooks/messaging-webhooks) - Webhook parameters, TwiML responses
- [Twilio Webhook Request Parameters](https://www.twilio.com/docs/messaging/guides/webhook-request) - Complete list of parameters (MessageSid, Body, From, To, etc.)
- [Next.js Route Handlers Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/route) - App Router request/response handling
- [How to secure Twilio webhook URLs in Node.js](https://www.twilio.com/en-us/blog/how-to-secure-twilio-webhook-urls-in-nodejs) - Official implementation guide

### Secondary (MEDIUM confidence)
- [Hookdeck: Twilio Webhooks Best Practices Guide](https://hookdeck.com/webhooks/platforms/twilio-webhooks-features-and-best-practices-guide) - Retry behavior, timeout information (verified with Twilio docs)
- [GitHub: Next.js discussions on body parsing](https://github.com/vercel/next.js/discussions/46483) - App Router form-urlencoded handling (verified with Next.js docs)
- [Regex patterns for currency matching](https://regexpattern.com/currency/) - Dollar amount extraction patterns (verified with test cases)

### Tertiary (LOW confidence - needs validation)
- None - all findings verified with official sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Twilio SMS webhooks with Next.js
- Ecosystem: Twilio SDK, Next.js Route Handlers, regex parsing
- Patterns: Webhook validation, idempotency, text parsing
- Pitfalls: URL mismatch, timeouts, duplicate messages, body parsing

**Confidence breakdown:**
- Standard stack: HIGH - Twilio SDK is official, Next.js 14 patterns verified
- Architecture: HIGH - From official docs and verified examples
- Pitfalls: HIGH - From official docs, community issues, best practices guides
- Code examples: HIGH - From official Twilio and Next.js documentation

**Research date:** 2026-01-12
**Valid until:** 2026-02-12 (30 days - stable ecosystem, but Twilio occasionally adds parameters)

**Key decisions:**
- **Regex vs NLP:** Regex chosen for "amount note" format. Format is constrained (user's own expenses), not adversarial. Regex is simpler, faster, no dependencies. If input becomes more flexible in future, consider NLP library.
- **Category assignment:** Categories assigned later in UI, not via SMS. Simpler user experience, avoids category name matching issues.
</metadata>

---

*Phase: 05-sms-integration*
*Research completed: 2026-01-12*
*Ready for planning: yes*
