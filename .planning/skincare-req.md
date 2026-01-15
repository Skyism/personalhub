Product Requirements Document (PRD)
Feature: Skincare Reminder (SMS via Twilio)
Owner

Jeffrey Shen

Status

Planned

Target User

Primary: Me (single-user personal app)

Secondary (future): Any user who wants scheduled skincare reminders via SMS

1. Problem Statement

I want a reliable, low-friction way to remember my skincare routine every morning and night. Push notifications are easy to ignore; SMS is harder to miss. I want the messages to be personalized, especially at night, where routines vary or motivation helps.

2. Goals & Success Criteria
Goals

Send automatic SMS reminders for skincare routines

Allow custom message editing and saving

Support different message behavior for morning vs night

Success Criteria

I receive:

The same SMS every morning

A rotating or selectable SMS at night

Messages arrive within ±5 minutes of scheduled time

Messages persist across restarts and deployments

Message customization survives page reloads and logouts

3. Non-Goals (Out of Scope for v1)

Push notifications (SMS only)

Image attachments or MMS

AI-generated skincare advice

Multiple users / shared routines

Timezone auto-detection (manual for now)

4. User Stories
Core

As a user, I want to receive a morning skincare reminder every day with a consistent message.

As a user, I want to receive a night skincare reminder every day with a message that can vary.

As a user, I want to edit and save both morning and night reminder messages.

As a user, I want my changes to take effect without redeploying the app.

Optional / Nice-to-have

As a user, I want to enable/disable reminders without deleting messages.

As a user, I want to preview the SMS before saving.

5. Functional Requirements
5.1 Scheduling

System shall send:

1 morning SMS per day

1 night SMS per day

Schedule times are configurable (default):

Morning: 8:00 AM

Night: 10:30 PM

5.2 Morning Messages

Stored as a single persistent message

Same message sent every morning

Editable via UI

Example:

“Good morning! Wash face, moisturize, sunscreen ☀️”

5.3 Night Messages

Stored as a list of messages

Each message is:

Editable

Addable

Deletable

Night reminder behavior (v1):

System selects one message at random

Example:

“Cleanser → toner → moisturizer 😴”

“You’ll thank yourself tomorrow. Do skincare.”

“Night routine time. No excuses.”

5.4 Message Customization

UI allows:

Editing morning message

Adding/editing/removing night messages

Messages are saved to database

Changes take effect immediately for next scheduled send

5.5 SMS Delivery (Twilio)

Use Twilio Programmable SMS

Messages must:

Be plain text

Fit within 160 characters (soft limit warning in UI)

Retry logic:

If Twilio fails, log error

No resend attempt in v1

6. Non-Functional Requirements
Reliability

Messages must not be duplicated

Messages must not send if feature is disabled

Security

Twilio credentials stored as environment variables

No phone numbers exposed in frontend code

Performance

SMS job execution < 2 seconds per send

7. Data Model: up to claude

8. UX / UI Requirements
Settings Page

Section: Skincare Reminders

Toggle: Morning reminder ON/OFF

Textarea: Morning message

Time picker: Morning time

Toggle: Night reminder ON/OFF

List editor:

Add night message

Edit existing messages

Delete message

Save button

“Saved ✓” confirmation state

9. Edge Cases

No night messages exist → do not send night SMS

Message exceeds character limit → show warning, still allow save

Twilio error → log and surface status in admin/dev console

App server restarts → scheduled jobs recover from DB state

10. Future Enhancements

Per-day night messages (Mon–Sun)

Streak tracking (“You completed skincare X days in a row”)

Integration with fitness/sleep data

AI-generated motivational night messages

Multi-user support

11. Open Questions

Should night messages rotate sequentially instead of random?

Should “missed” reminders be sent if the server was down?

Should SMS include an opt-out keyword (for compliance)?