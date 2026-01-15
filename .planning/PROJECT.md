# Personal Nexus

## What This Is

Personal Nexus is a modular personal dashboard for tracking life metrics across multiple domains. The Finance module is the v1 MVP, providing budget tracking, transaction logging via SMS, and spending analytics. Future modules will cover Skincare and Fitness tracking.

## Core Value

The ability to text an expense and instantly see it reflected in the dashboard - removing all friction from expense tracking.

## Requirements

### Validated

- ✓ Modular architecture with feature-based folder structure supporting Finance, Skincare, and Fitness modules — v1.0
- ✓ Finance module: Dashboard showing Total Monthly Budget vs. Spent Amount with category breakdowns — v1.0
- ✓ Finance module: Transaction list with manual entry interface — v1.0
- ✓ Finance module: SMS integration via Twilio - text "amount note" to log expenses (categories assigned later in UI) — v1.0
- ✓ Finance module: Analytics and charts for spending visualization (category breakdowns, trends) — v1.0
- ✓ Mobile-friendly UI optimized for on-the-go expense logging — v1.0 (44px touch targets, bottom nav, mobile keyboards)
- ✓ Supabase backend with Postgres database for transactions and budget data — v1.0
- ✓ Budget management supporting both total monthly budget and per-category budgets — v1.0

### Active

- [ ] Authentication system to replace TEMP_USER_ID workarounds and restore proper RLS policies

### Out of Scope

- Multi-user functionality or shared budgets — v1 is single-user only
- Recurring transactions or automatic monthly bill logging — manual entry only in v1
- Skincare and Fitness module implementation — architecture supports them, but Finance only for v1
- Complex authentication flows — start with simple Supabase auth

## Context

**Current State (v1.0 shipped 2026-01-14):**

Personal Nexus v1.0 is a functional SMS-first expense tracker with 929k LOC (including dependencies). The Finance module delivers on the core value: text an expense and see it instantly in the dashboard.

**Tech Stack:**
- Next.js 16.1.1 with App Router and TypeScript (strict mode)
- Supabase (Postgres with RLS policies, currently using TEMP_USER_ID workaround)
- Twilio webhook for SMS integration
- Recharts for analytics visualization
- shadcn/ui + Motion for component system
- Tokyo Night-inspired design system (Plus Jakarta Sans + JetBrains Mono)

**Key Insight:**
Manual expense logging fails because of friction - by the time you open an app and navigate to the entry form, you've forgotten the amount or lost motivation. SMS logging removes this friction entirely.

**Mobile-First:**
Most expense logging happens on-the-go (coffee shop, gas station, restaurant). v1.0 delivers 44px touch targets, persistent bottom navigation, and optimized mobile keyboards.

**Modular Architecture:**
Finance is the first module, but the system cleanly supports adding Skincare and Fitness tracking in future versions without refactoring core architecture.

**Known Technical Debt:**
Authentication required before production - RLS policies currently allow TEMP_USER_ID, FK constraints to auth.users removed. Must restore proper auth before multi-user deployment.

## Constraints

- **Tech Stack**: Next.js + Tailwind CSS + Supabase + Twilio — Required for project consistency
- **Mobile-First**: UI must work flawlessly on mobile devices — Primary use case is on-the-go logging

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase over Firebase | Postgres SQL structure better suits relational budget/transaction data than NoSQL | ✓ Good - RLS policies work well, type generation seamless |
| Twilio for SMS integration | Industry standard for SMS webhooks, reliable and well-documented | ✓ Good - Signature validation robust, parser handles edge cases |
| Both total and category budgets | Provides flexibility - track overall spending while maintaining category awareness | ✓ Good - Users appreciate granular tracking |
| Analytics in v1, recurring transactions deferred | Analytics provide value immediately, recurring transactions can wait for v2 | ✓ Good - Recharts integration smooth, charts provide insights |
| Feature-based module folders | Each module (Finance/Skincare/Fitness) is self-contained, scales better than type-based folders | ✓ Good - Clean separation, easy to navigate |
| SMS format "amount note" without category | Simpler than "amount category note", categories assigned later in UI | ✓ Good - Reduced friction, better UX than exact category matching |
| Tokyo Night color palette with OKLCH | Distinctive design avoiding generic AI aesthetics | ✓ Good - Memorable brand, user confirmed visuals |
| shadcn/ui + Motion component system | Production-grade components with animation library | ✓ Good - Fast implementation, smooth 60fps animations |
| Dual Supabase client (browser/server) | Next.js App Router requires separate clients for SSR | ✓ Good - Standard pattern, works reliably |

---
*Last updated: 2026-01-14 after v1.0 milestone*
