# Personal Nexus

## What This Is

Personal Nexus is a modular personal dashboard for tracking life metrics across multiple domains. The Finance module is the v1 MVP, providing budget tracking, transaction logging via SMS, and spending analytics. Future modules will cover Skincare and Fitness tracking.

## Core Value

The ability to text an expense and instantly see it reflected in the dashboard - removing all friction from expense tracking.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Modular architecture with feature-based folder structure supporting Finance, Skincare, and Fitness modules
- [ ] Finance module: Dashboard showing Total Monthly Budget vs. Spent Amount with category breakdowns
- [ ] Finance module: Transaction list with manual entry interface
- [ ] Finance module: SMS integration via Twilio - text "amount category note" to log expenses
- [ ] Finance module: Analytics and charts for spending visualization (category breakdowns, trends)
- [ ] Mobile-friendly UI optimized for on-the-go expense logging
- [ ] Supabase backend with Postgres database for transactions and budget data
- [ ] Budget management supporting both total monthly budget and per-category budgets

### Out of Scope

- Multi-user functionality or shared budgets — v1 is single-user only
- Recurring transactions or automatic monthly bill logging — manual entry only in v1
- Skincare and Fitness module implementation — architecture supports them, but Finance only for v1
- Complex authentication flows — start with simple Supabase auth

## Context

This is a greenfield Next.js project built to solve personal expense tracking friction. The key insight is that manual expense logging fails because of friction - by the time you open an app and navigate to the entry form, you've forgotten the amount or lost motivation. SMS logging removes this friction entirely.

The modular architecture is intentional - Finance is the first module, but the system should cleanly support adding Skincare and Fitness tracking in future versions without refactoring core architecture.

Mobile experience is critical since most expense logging happens on-the-go (coffee shop, gas station, restaurant). Desktop is secondary.

## Constraints

- **Tech Stack**: Next.js + Tailwind CSS + Supabase + Twilio — Required for project consistency
- **Mobile-First**: UI must work flawlessly on mobile devices — Primary use case is on-the-go logging

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase over Firebase | Postgres SQL structure better suits relational budget/transaction data than NoSQL | — Pending |
| Twilio for SMS integration | Industry standard for SMS webhooks, reliable and well-documented | — Pending |
| Both total and category budgets | Provides flexibility - track overall spending while maintaining category awareness | — Pending |
| Analytics in v1, recurring transactions deferred | Analytics provide value immediately, recurring transactions can wait for v2 | — Pending |
| Feature-based module folders | Each module (Finance/Skincare/Fitness) is self-contained, scales better than type-based folders | — Pending |

---
*Last updated: 2026-01-11 after initialization*
