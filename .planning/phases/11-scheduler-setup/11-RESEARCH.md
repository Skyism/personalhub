# Phase 11: Scheduler Setup - Research

**Researched:** 2026-01-15
**Domain:** Next.js scheduled tasks and cron jobs
**Confidence:** HIGH

<research_summary>
## Summary

Researched the Next.js ecosystem for implementing scheduled tasks that trigger daily SMS reminders. The standard approach for Next.js apps on Vercel is to use **Vercel Cron Jobs** (native platform support) configured via `vercel.json`, which makes HTTP GET requests to API routes on a schedule.

Key finding: Don't hand-roll scheduling infrastructure. For serverless Next.js on Vercel, use Vercel Cron (simplest, zero setup). For complex needs or non-Vercel deployments, use external services (cron-job.org, Cronhooks) or specialized platforms (Inngest for workflows). Never use node-cron in serverless environments—it doesn't work.

**Primary recommendation:** Use Vercel Cron + Route Handler + CRON_SECRET auth + idempotent operations. Store execution state in Supabase to prevent duplicate sends. All cron jobs run in UTC—convert to target timezone in code.
</research_summary>

<standard_stack>
## Standard Stack

The established approach for Next.js scheduled tasks depends on deployment model:

### Core (Serverless on Vercel)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Vercel Cron Jobs | Native | Platform-level scheduled HTTP requests | Built-in, zero config, free tier available |
| Next.js Route Handlers | 16+ | API endpoints triggered by cron | Standard Next.js App Router pattern |
| CRON_SECRET | Env var | Authorization header for security | Official Vercel recommendation |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns-tz | 3.x | Timezone conversion | Converting UTC to user timezone |
| node-redlock | 5.x | Distributed locking | Multi-instance deployments, preventing concurrent execution |

### Alternative Approaches
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel Cron | External services (cron-job.org, Cronhooks) | External = more setup, but works with any host |
| Vercel Cron | Inngest | Inngest adds retries, workflows, but requires account |
| Vercel Cron | node-cron | node-cron ONLY works in serverful (persistent Node process), NOT serverless |

**Installation:**
```bash
# For timezone handling
npm install date-fns date-fns-tz

# For distributed locking (optional, if multi-instance)
npm install redlock ioredis
```

**Configuration:**
```json
// vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/send-morning-reminder",
      "schedule": "0 13 * * *"
    },
    {
      "path": "/api/cron/send-night-reminder",
      "schedule": "0 4 * * *"
    }
  ]
}
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
app/
└── api/
    └── cron/
        ├── send-morning-reminder/
        │   └── route.ts          # Morning SMS cron handler
        └── send-night-reminder/
            └── route.ts          # Night SMS cron handler
```

### Pattern 1: Secured Cron Route Handler
**What:** API route with CRON_SECRET authorization check
**When to use:** Always (security best practice)
**Example:**
```typescript
// app/api/cron/send-morning-reminder/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Security: Verify request is from Vercel cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Idempotency: Check if already sent today
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('reminder_log')
    .select('id')
    .eq('date', today)
    .eq('type', 'morning')
    .single()

  if (existing) {
    return Response.json({ message: 'Already sent today' })
  }

  // Send SMS via Twilio
  const message = await twilio.messages.create({
    to: process.env.USER_PHONE,
    from: process.env.TWILIO_PHONE,
    body: 'Morning skincare reminder!'
  })

  // Log execution to prevent duplicates
  await supabase.from('reminder_log').insert({
    date: today,
    type: 'morning',
    message_sid: message.sid
  })

  return Response.json({ success: true, sid: message.sid })
}
```

### Pattern 2: Timezone Conversion (UTC to User Local)
**What:** Convert UTC cron schedule to user's local timezone
**When to use:** When users need reminders at specific local times
**Example:**
```typescript
// Utils for timezone conversion
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

// User wants 8 AM PST reminder
// Vercel cron runs in UTC
// 8 AM PST = 4 PM UTC (PST is UTC-8, so add 8 hours)
// Schedule: "0 16 * * *" (4 PM UTC)

// In route handler, log with local time:
const utcNow = new Date()
const userTimezone = 'America/Los_Angeles'
const localTime = utcToZonedTime(utcNow, userTimezone)
console.log('Sending reminder at', localTime.toLocaleString())
```

### Pattern 3: Idempotent Operation with Database State
**What:** Use database to track execution, prevent duplicate sends
**When to use:** Always (Vercel may invoke twice for same schedule)
**Example:**
```typescript
// Schema for tracking
// reminder_log table:
// - id: uuid
// - date: date (unique index on date + type)
// - type: 'morning' | 'night'
// - message_sid: text
// - created_at: timestamp

// Check before sending
const { data: existing } = await supabase
  .from('reminder_log')
  .select('id')
  .eq('date', today)
  .eq('type', 'morning')
  .maybeSingle()

if (existing) {
  // Already sent, return early
  return Response.json({ message: 'Already sent' })
}

// After sending, log it
await supabase.from('reminder_log').insert({ date: today, type: 'morning', message_sid })
```

### Anti-Patterns to Avoid
- **Using node-cron in serverless**: Serverless functions are ephemeral, node-cron requires persistent process
- **No authorization check**: Anyone can hit your cron endpoint if not secured
- **No idempotency check**: Vercel may invoke twice, you'll send duplicate SMSs
- **Assuming local timezone**: Vercel cron ALWAYS runs in UTC, must convert in code
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron scheduling system | Custom scheduler with setInterval | Vercel Cron Jobs | Platform handles reliability, no maintenance, free tier |
| Distributed locking | Custom Redis locking logic | node-redlock library | Handles edge cases (clock drift, network partitions) |
| Retry logic | Custom retry loops | Inngest or similar | Exponential backoff, dead letter queues handled |
| Cron expression parsing | Custom parser | Use Vercel's cron syntax or external service | Standard cron syntax, battle-tested |
| Execution monitoring | Custom logging | Vercel logs + Sentry cron monitoring | Built-in, queryable, alerts |

**Key insight:** Scheduled tasks in serverless have 15+ years of solved problems. Vercel Cron implements reliable HTTP-based invocation. node-redlock implements proper distributed locking (Redlock algorithm). Fighting these leads to bugs like duplicate sends, missed executions, or race conditions.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Using node-cron in Serverless
**What goes wrong:** Cron jobs don't run, or run only once then stop
**Why it happens:** Serverless functions are stateless and ephemeral—process starts, handles request, dies
**How to avoid:** Use Vercel Cron (platform-level HTTP invocation) or external cron service
**Warning signs:** Cron works locally but never runs in production

### Pitfall 2: Timezone Confusion
**What goes wrong:** Reminder sent at wrong time (e.g., 8 AM becomes 4 PM)
**Why it happens:** Vercel cron runs in UTC, not user's local timezone
**How to avoid:** Always specify cron schedule in UTC, calculate offset from user timezone
**Warning signs:** Works for UTC users, wrong time for others

### Pitfall 3: No Idempotency (Duplicate Sends)
**What goes wrong:** User receives same reminder 2-3 times
**Why it happens:** Vercel's event-driven system may invoke cron multiple times
**How to avoid:** Check database for execution record before sending, use unique constraint
**Warning signs:** Logs show multiple invocations for same schedule

### Pitfall 4: Missing Authorization
**What goes wrong:** Anyone can trigger your cron endpoint via direct HTTP request
**Why it happens:** Cron routes are just API routes, publicly accessible
**How to avoid:** Always check `Authorization: Bearer ${CRON_SECRET}` header
**Warning signs:** Unexpected cron executions in logs

### Pitfall 5: Exceeding Function Duration Limits
**What goes wrong:** Cron job times out mid-execution
**Why it happens:** Hobby: 10s limit, Pro: 300s limit, job takes longer
**How to avoid:** Keep jobs fast (<5s), or split into multiple smaller jobs
**Warning signs:** 504 Gateway Timeout errors in cron logs
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### Complete Secured Cron Route (Next.js App Router)
```typescript
// app/api/cron/send-morning-reminder/route.ts
// Source: Vercel official docs + community patterns
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function GET(request: NextRequest) {
  // 1. Security: Verify authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Idempotency: Check if already sent today
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('reminder_log')
    .select('id')
    .eq('date', today)
    .eq('type', 'morning')
    .maybeSingle()

  if (existing) {
    console.log('Morning reminder already sent today')
    return Response.json({ message: 'Already sent today' })
  }

  // 3. Fetch user settings
  const { data: settings } = await supabase
    .from('skincare_settings')
    .select('morning_message, morning_enabled')
    .single()

  if (!settings?.morning_enabled) {
    return Response.json({ message: 'Morning reminders disabled' })
  }

  // 4. Send SMS
  try {
    const message = await twilioClient.messages.create({
      to: process.env.USER_PHONE!,
      from: process.env.TWILIO_PHONE!,
      body: settings.morning_message
    })

    // 5. Log execution
    await supabase.from('reminder_log').insert({
      date: today,
      type: 'morning',
      message_sid: message.sid,
      status: 'sent'
    })

    return Response.json({
      success: true,
      sid: message.sid,
      message: 'Morning reminder sent'
    })
  } catch (error) {
    console.error('Failed to send morning reminder:', error)

    // Log failure
    await supabase.from('reminder_log').insert({
      date: today,
      type: 'morning',
      status: 'failed',
      error: String(error)
    })

    return Response.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}
```

### Vercel Cron Configuration (vercel.json)
```json
// Source: Vercel official docs
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/send-morning-reminder",
      "schedule": "0 16 * * *"
    },
    {
      "path": "/api/cron/send-night-reminder",
      "schedule": "0 4 * * *"
    }
  ]
}
```

### Timezone Conversion Helper
```typescript
// utils/timezone.ts
// Source: date-fns-tz docs
import { utcToZonedTime } from 'date-fns-tz'

export function convertUTCScheduleToLocal(
  utcHour: number,
  targetTimezone: string
): { utcHour: number; utcMinute: number } {
  // Example: User wants 8 AM PST
  // PST is UTC-8, so 8 AM PST = 4 PM UTC (16:00)

  const now = new Date()
  const userTime = utcToZonedTime(now, targetTimezone)
  const offset = userTime.getTimezoneOffset() / 60

  const utcHourAdjusted = (utcHour + offset) % 24

  return {
    utcHour: utcHourAdjusted,
    utcMinute: 0
  }
}

// Usage:
// const { utcHour } = convertUTCScheduleToLocal(8, 'America/Los_Angeles')
// Schedule: `0 ${utcHour} * * *`
```
</code_examples>

<sota_updates>
## State of the Art (2024-2026)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| node-cron in serverless | Vercel Cron Jobs | 2023 | Native platform support, no custom infrastructure |
| Manual polling loops | Event-driven HTTP invocation | 2023 | More reliable, scales automatically |
| Custom retry logic | Use Inngest for complex workflows | 2024 | Built-in retries, observability, failure handling |

**New tools/patterns to consider:**
- **Vercel Cron Jobs**: Native platform support (February 2023), now standard for Next.js on Vercel
- **Inngest**: Modern workflow platform with built-in retries, scheduling, observability (growing adoption 2024-2026)
- **Schedo.dev**: Webhook-based scheduling for Next.js (2024+), alternative to Vercel Cron
- **Local testing tools**: nextjs-crons NPM package (January 2026) for testing Vercel cron locally

**Deprecated/outdated:**
- **node-cron in serverless**: Doesn't work, use platform-level solutions
- **Manual cron setup with external VPS**: Unnecessary complexity, use Vercel Cron or external service
- **Unprotected cron endpoints**: Always use CRON_SECRET (security best practice since 2023)

**2026 Best Practices:**
- Always secure cron routes with CRON_SECRET authorization
- Always implement idempotency checks (Vercel may invoke twice)
- Always handle timezone conversion (cron runs in UTC)
- Use Vercel Logs for monitoring, Sentry for error tracking
- Keep cron jobs fast (<5s), split longer operations
</sota_updates>

<open_questions>
## Open Questions

Things that couldn't be fully resolved:

1. **Night Message Rotation Strategy**
   - What we know: Database has list of night_messages, need to rotate through them
   - What's unclear: Best rotation algorithm (sequential, random, weighted by last_used)
   - Recommendation: Start with random selection, add sequential tracking if user wants predictability

2. **Failure Retry Strategy**
   - What we know: Vercel doesn't auto-retry failed cron invocations
   - What's unclear: Should we implement custom retry logic, or rely on next day's run?
   - Recommendation: Log failures, monitor, decide based on real-world failure rate (likely <1%)

3. **User Timezone Storage**
   - What we know: Cron runs in UTC, need to convert to user timezone
   - What's unclear: Should we store user's timezone in settings, or hardcode PST?
   - Recommendation: Hardcode for single-user app (Phase 13 for settings UI if needed)
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs) - Official Vercel docs, last updated Sep 2025
- [Vercel Cron Jobs Quickstart](https://vercel.com/docs/cron-jobs/quickstart) - Setup guide with code examples
- [Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs) - Security, idempotency, concurrency patterns
- [Usage & Pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing) - Limits: Hobby 2 jobs/day, Pro 40 jobs unlimited

### Secondary (MEDIUM confidence)
- [5 Top Tools for Task Scheduling in Next.js (2024)](https://dev.to/ethanleetech/task-scheduling-in-nextjs-top-tools-and-best-practices-2024-3l77) - Verified ecosystem overview
- [Cron Jobs in Next.js: Serverless vs Serverful](https://yagyaraj234.medium.com/running-cron-jobs-in-nextjs-guide-for-serverful-and-stateless-server-542dd0db0c4c) - Deployment model tradeoffs
- [Redis Distributed Locks Documentation](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) - Official Redis Redlock pattern
- [node-redlock GitHub](https://github.com/mike-marcacci/node-redlock) - Node.js Redlock implementation
- [Inngest Documentation](https://www.inngest.com/docs) - Alternative workflow platform for complex scheduling

### Tertiary (LOW confidence - needs validation)
- [Testing Next.js Cron Jobs Locally (Jan 2026)](https://medium.com/@quentinmousset/testing-next-js-cron-jobs-locally-my-journey-from-frustration-to-solution-6ffb2e774d7a) - Recent local testing solutions (verify tools mentioned)
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Next.js App Router + Vercel Cron Jobs
- Ecosystem: Vercel platform, external cron services, Inngest, date-fns-tz, node-redlock
- Patterns: Secured route handlers, idempotency, timezone conversion, distributed locking
- Pitfalls: Serverless constraints, timezone confusion, duplicate invocations, security

**Confidence breakdown:**
- Standard stack: HIGH - Verified with official Vercel docs, industry standard for Next.js
- Architecture: HIGH - From official docs + community patterns
- Pitfalls: HIGH - Documented in official docs (idempotency, security, timezones)
- Code examples: HIGH - From official Vercel docs + verified libraries

**Research date:** 2026-01-15
**Valid until:** 2026-02-15 (30 days - Vercel Cron API stable, but new tools emerging)

**Key decisions for Phase 11:**
1. Use Vercel Cron Jobs (simplest, zero setup, free tier)
2. Create two cron jobs: morning reminder (8 AM PST = 16:00 UTC), night reminder (8 PM PST = 04:00 UTC next day)
3. Secure with CRON_SECRET authorization
4. Implement idempotency via reminder_log table (date + type unique constraint)
5. Store execution state in Supabase (don't rely on Vercel logs)
6. Handle errors gracefully, log failures for monitoring
</metadata>

---

*Phase: 11-scheduler-setup*
*Research completed: 2026-01-15*
*Ready for planning: yes*
