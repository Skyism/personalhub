# Roadmap: Personal Nexus

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-8) — SHIPPED 2026-01-14
- 🚧 **v1.1 Skincare Reminders** - Phases 9-13 (in progress)

## Overview

Personal Nexus delivers a modular personal dashboard with SMS-first expense tracking. v1.0 MVP delivered the Finance module with SMS integration, analytics, and Tokyo Night design system.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>✅ v1.0 MVP (Phases 1-8) — SHIPPED 2026-01-14</summary>

- [x] **Phase 1: Foundation** - Next.js project setup with modular architecture
- [x] **Phase 2: Supabase Backend** - Database schema and API integration
- [x] **Phase 3: Budget Management** - Budget creation and category management UI
- [x] **Phase 4: Transaction System** - Manual transaction entry and display
- [x] **Phase 5: SMS Integration** - Twilio webhook for SMS expense logging
- [x] **Phase 6: Analytics Dashboard** - Charts and spending visualization
- [x] **Phase 7: Mobile Polish** - Mobile-responsive optimization and UX refinement
- [x] **Phase 8: UI Overhaul** - Distinctive design system with unique typography, motion, and aesthetics

[See full details in milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

## Phase Details

### 🔧 Urgent Insertions

#### Phase 8.1: Semi-Annual Wants Budget (INSERTED)

**Goal**: Add semi-annual "wants" budget tracking outside monthly budgets with 6-month periods (Jan-Jun, Jul-Dec), SMS transaction support, and full CRUD operations
**Depends on**: Phase 8 (UI Overhaul - v1.0 complete)
**Research**: Complete (analyzed existing Finance schema and SMS integration patterns)
**Status**: Complete
**Plans**: 4/4 complete

Plans:
- [x] 8.1-01: Database Schema (wants_budgets and wants_transactions tables with period utilities) - Completed 2026-01-15
- [x] 8.1-02: SMS Integration Extension (extend parser for "wants" keyword, route to wants transactions) - Completed 2026-01-15
- [x] 8.1-03: Budget UI Foundation (setup page, overview with progress, navigation integration) - Completed 2026-01-15
- [x] 8.1-04: Transaction CRUD (list, add, edit, delete with Server Actions) - Completed 2026-01-15

**Details:**
Urgent Finance module enhancement requested mid-milestone. Extends budget tracking to support:
- Semi-annual "wants" categories with fixed amounts per half-year period
- Separate from monthly budget system (parallel tracking)
- Full SMS integration via existing Twilio endpoint
- CRUD operations for transactions in wants categories
- Period-based rollover (Jan-Jun and Jul-Dec)

**Result:** Phase 8.1 complete. All plans executed successfully. Full wants budget feature shipped with database schema, SMS integration, UI with progress tracking, and complete transaction CRUD operations.

#### Phase 8.2: Hierarchical Navigation System (INSERTED)

**Goal**: Add hierarchical navigation system with breadcrumbs, top app bar with back button, desktop navigation component, and home page module links for complete navigation between app home, Finance module, and all subpages
**Depends on**: Phase 8.1 (Wants Budget - navigation integration points created)
**Research**: Complete (8.2-RESEARCH.md created 2026-01-16)
**Status**: Complete
**Plans**: 3/3 complete

Plans:
- [x] 8.2-01: Home Page & Navigation Foundation (module cards, fix BottomNav routing) - Completed 2026-01-19
- [x] 8.2-02: Breadcrumb & Top App Bar System (dynamic breadcrumbs, back button, TopAppBar integration) - Completed 2026-01-19
- [x] 8.2-03: Desktop Navigation (DesktopNav sidebar, responsive layout grid) - Completed 2026-01-19

**Details:**
Critical UX gaps identified in current navigation:
- No navigation from home page to Finance module (users must type URL manually)
- Desktop users have no navigation (BottomNav hidden on lg+ screens)
- No way to return to app home from Finance pages (trapped in module)
- Inconsistent/missing back buttons across subpages
- No breadcrumbs for hierarchical context
- Broken navigation structure (Analytics "Back to Budgets", Categories broken breadcrumb)

**Target improvements:**
- Home page navigation cards to modules (Finance, future: Skincare/Fitness)
- Top app bar with back button for all subpages
- Dynamic breadcrumb component (mobile: last 2 items, desktop: full trail)
- Desktop navigation (sidebar or top nav) paralleling BottomNav
- Fix BottomNav "Home" to navigate to app root (/)
- Consistent back button behavior across all pages
- Clear visual hierarchy: App > Module > Section > Detail

**Result:** Phase 8.2 complete. All plans executed successfully. Complete hierarchical navigation system shipped with home page module cards, dynamic breadcrumbs with W3C ARIA accessibility, TopAppBar with back button integration across all Finance pages, and desktop sidebar navigation. Solves all critical UX gaps: users can now navigate from home to modules, desktop has visible navigation, clear back button behavior, and breadcrumb context throughout the app.

### 🔄 v1.1 Skincare Routine Tracker (Pivoted)

**Milestone Goal:** Daily skincare routine tracker with customizable Monday-Sunday schedule for morning and night routines. Display today's routine for quick reference.

**Status:** PIVOTED from SMS reminders (Phases 9-11 deprecated). New implementation starting with Phase 9.1.

#### Phase 9: Skincare Schema (DEPRECATED)

**Goal**: ~~Create database schema for reminder settings, morning message, and night messages list~~
**Status**: DEPRECATED - Milestone pivoted from SMS reminders to routine tracker
**Plans**: 1/1 complete (deprecated implementation)

Plans:
- [x] **09-01-PLAN.md** - Skincare Schema (skincare_settings and night_messages tables with RLS) - Completed 2026-01-15 (DEPRECATED)

**Note:** This phase built SMS reminder schema. Use Phase 9.1 for routine tracker schema instead.

#### Phase 10: Settings UI (DEPRECATED)

**Goal**: ~~Build settings page for configuring morning/night reminders with message editing and time selection~~
**Status**: DEPRECATED - Milestone pivoted from SMS reminders to routine tracker
**Plans**: 2/2 complete (deprecated implementation)

Plans:
- [x] 10-01: Settings page foundation with morning reminder form (completed 2026-01-14) (DEPRECATED)
- [x] 10-02: Night reminder configuration with message list management (completed 2026-01-15) (DEPRECATED)

**Note:** This phase built SMS reminder UI. Use Phase 9.1 series for routine tracker UI instead.

#### Phase 11: Scheduler Setup (DEPRECATED)

**Goal**: ~~Implement cron job or scheduled task system for triggering daily SMS sends~~
**Status**: DEPRECATED - No longer needed for routine tracker (no SMS reminders)
**Plans**: 2/2 complete (deprecated implementation)

Plans:
- [x] 11-01: Database & Morning Reminder (reminder_log table, morning cron endpoint with CRON_SECRET) - Completed 2026-01-15 (DEPRECATED)
- [x] 11-02: Night Reminder & Deployment (night cron endpoint with message rotation, vercel.json config) - Completed 2026-01-15 (DEPRECATED)

**Note:** This phase built cron endpoints for SMS. Not needed for routine display tracker.

#### Phase 12: SMS Reminders (REMOVED)

**Status**: REMOVED - Milestone pivoted to routine tracker (no SMS functionality needed)

#### Phase 13: Polish & Edge Cases (REMOVED)

**Status**: REMOVED - Milestone pivoted to routine tracker

---

### New Phases for Routine Tracker

#### Phase 9.1: Skincare Routine Schema

**Goal**: Create database schema for storing daily routines (Monday-Sunday) with morning and night routine steps for each day
**Depends on**: Phase 8.2 (Navigation complete)
**Research**: Unlikely (established Supabase patterns from Finance module)
**Status**: Complete
**Plans**: 1/1 complete

Plans:
- [x] 9.1-01: Skincare Routine Schema (skincare_routines table with JSONB steps, RLS policies, TypeScript types, sample data) - Completed 2026-01-19

**Details:**
Database schema to store:
- User's weekly routine (7 days × 2 time periods = 14 routine slots)
- Each routine slot contains list of steps/products
- Schema options: JSON column, separate routine_steps table, or day-specific columns
- Must support: add/edit/delete steps, reorder steps, mark as complete (optional)

#### Phase 9.2: Routine Management UI

**Goal**: Build UI for editing routines - configure morning and night routines for each day of the week
**Depends on**: Phase 9.1
**Research**: Skipped (CRUD UI with existing Finance patterns)
**Status**: Ready for execution
**Plans**: 2/2 created

Plans:
- [ ] 9.2-01: Routine Management Foundation (Server Actions, day selector, home navigation)
- [ ] 9.2-02: Routine Step Editor (add, edit, delete, reorder steps with save)

**Details:**
Settings/edit page where users can:
- Select day of week (Monday-Sunday tabs or dropdown)
- Edit morning routine steps (add, edit, delete, reorder)
- Edit night routine steps (add, edit, delete, reorder)
- Save changes to database
- Copy routines between days (optional convenience feature)

#### Phase 9.3: Routine Display View

**Goal**: Build main Skincare module view that displays today's routine (or selected day) for morning and night
**Depends on**: Phase 9.2
**Research**: Unlikely (display patterns established)
**Status**: Not started
**Plans**: TBD

Plans:
- [ ] 9.3-01: TBD

**Details:**
Main skincare page (/skincare) showing:
- Today's date and day of week prominently displayed
- Morning routine section with list of steps
- Night routine section with list of steps
- Day selector to view other days' routines
- Link/button to edit routines (navigate to Phase 9.2 UI)
- Optional: checkboxes to mark steps as complete (ephemeral, doesn't persist)

<details>
<summary>✅ v1.0 MVP Phase Details (Archived) — See milestones/v1.0-ROADMAP.md</summary>

### Phase 1: Foundation
**Goal**: Establish Next.js project with modular architecture and base layout
**Depends on**: Nothing (first phase)
**Research**: Unlikely (Next.js project setup with established patterns)
**Plans**: 1/1 complete

Plans:
- [x] **1-01-PLAN.md** - Foundation Setup (Next.js + TypeScript + Tailwind + modular structure) - Completed 2026-01-11

### Phase 2: Supabase Backend
**Goal**: Set up Supabase client, create database schema for budgets/transactions/categories, establish API integration patterns
**Depends on**: Phase 1
**Research**: Complete (DISCOVERY.md created 2026-01-11)
**Research topics**: Supabase client setup in Next.js, schema design for budgets/transactions/categories with proper relationships, Row Level Security policies for single-user app
**Plans**: 2/2 complete

Plans:
- [x] **02-01-PLAN.md** - Supabase Client Setup (browser + server clients with SSR support) - Completed 2026-01-11
- [x] **02-02-PLAN.md** - Database Schema Migration (budgets, transactions, categories tables with RLS policies) - Completed 2026-01-11

### Phase 3: Budget Management
**Goal**: Build UI for creating monthly budgets with total and per-category allocations
**Depends on**: Phase 2
**Research**: Unlikely (internal UI building on Phase 2 patterns)
**Plans**: 2/2 complete

Plans:
- [x] **03-01-PLAN.md** - Budget Overview & Creation (list, creation form, detail views) - Completed 2026-01-12
- [x] **03-02-PLAN.md** - Category Management (category CRUD and budget allocations) - Completed 2026-01-12

### Phase 4: Transaction System
**Goal**: Implement transaction list display and manual entry form with category assignment
**Depends on**: Phase 3
**Research**: Unlikely (CRUD operations with established Supabase patterns)
**Plans**: 2/2 complete

Plans:
- [x] **04-01-PLAN.md** - Transaction Display (list with date grouping and spending summary) - Completed 2026-01-12
- [x] **04-02-PLAN.md** - Manual Transaction Entry (entry form with category assignment) - Completed 2026-01-12

### Phase 5: SMS Integration
**Goal**: Integrate Twilio webhook to parse "amount note" SMS messages and create uncategorized transactions (categories assigned later in UI)
**Depends on**: Phase 4
**Status**: Complete
**Plans**: 2/2 complete

Plans:
- [x] **05-01-PLAN.md** - SMS Webhook Integration (Twilio webhook with text parsing and idempotent transaction creation) - Completed 2026-01-12
- [x] **05-02-PLAN.md** - Manual Transaction Categorization (inline category editing with Server Actions) - Completed 2026-01-13

### Phase 6: Analytics Dashboard
**Goal**: Create spending visualization with category breakdowns, trends, and budget vs actual charts
**Depends on**: Phase 4 (can run parallel to Phase 5 if needed)
**Status**: Complete
**Research**: Complete (DISCOVERY.md created 2026-01-13)
**Research topics**: Chart.js vs Recharts vs Tremor for React/Next.js, efficient aggregation queries for spending data in Supabase
**Plans**: 3/3 complete

Plans:
- [x] **06-01-PLAN.md** - Chart Foundation and Category Breakdown (Recharts setup, responsive wrapper, pie chart) - Completed 2026-01-13
- [x] **06-02-PLAN.md** - Spending Trends and Budget vs Actual (line/bar charts for trends and comparison) - Completed 2026-01-13
- [x] **06-03-PLAN.md** - Analytics Dashboard Page (dedicated /finance/analytics route with all charts) - Completed 2026-01-13

### Phase 7: Mobile Polish
**Goal**: Optimize mobile experience with responsive layouts, touch targets, and performance tuning
**Depends on**: Phases 5 and 6 (final polish after core features complete)
**Research**: Unlikely (Tailwind responsive patterns)
**Status**: Complete
**Plans**: 3/3 complete

Plans:
- [x] **07-01-PLAN.md** - Mobile Navigation and Touch Optimization (persistent bottom nav, viewport meta tags, 44px touch targets) - Completed 2026-01-13
- [x] **07-02-PLAN.md** - Performance and Loading Optimization (loading.tsx, error.tsx, dynamic chart imports) - Completed 2026-01-14
- [x] **07-03-PLAN.md** - Mobile Form and Input Optimization (inputMode, autoComplete, focus management, smooth scroll) - Completed 2026-01-14

### Phase 8: UI Overhaul
**Goal**: Transform the application with a distinctive, creative design system that avoids generic AI aesthetics. Implement unique typography, cohesive color themes, motion design, and atmospheric backgrounds to create a memorable user experience.
**Depends on**: Phase 7 (polish first, then transform)
**Status**: Complete
**Research**: Complete (DISCOVERY.md created 2026-01-14)
**Research topics**: shadcn/ui integration patterns, distinctive Google Fonts alternatives, CSS gradient techniques, Framer Motion for React animations, design inspiration from IDE themes
**Plans**: 3/3 complete

Plans:
- [x] **08-01-PLAN.md** - Design Foundation (Tokyo Night OKLCH palette, Plus Jakarta Sans + JetBrains Mono typography) - Completed 2026-01-14
- [x] **08-02-PLAN.md** - Component System (shadcn/ui Card/Button with Motion animations, semantic tokens) - Completed 2026-01-14
- [x] **08-03-PLAN.md** - Visual Enhancement (mesh gradient backgrounds, shadcn/ui forms, frosted glass navigation, animated charts) - Completed 2026-01-14

**Design Principles:**
- Typography: Unique, beautiful fonts (avoid Inter, Roboto, Arial, Space Grotesk)
- Color: Cohesive themes with dominant colors and sharp accents, CSS variables
- Motion: CSS animations + Framer Motion for high-impact moments, staggered reveals
- Backgrounds: Layered gradients, geometric patterns, atmospheric depth
- Components: shadcn/ui as foundation, customized with unique aesthetic
- Minimalist but distinctive: Clean layouts with unexpected, delightful touches

</details>

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → **8.1** → **8.2** → 9 → 10 → 11 → 12 → 13

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Foundation | v1.0 | 1/1 | Complete | 2026-01-11 |
| 2. Supabase Backend | v1.0 | 2/2 | Complete | 2026-01-11 |
| 3. Budget Management | v1.0 | 2/2 | Complete | 2026-01-12 |
| 4. Transaction System | v1.0 | 2/2 | Complete | 2026-01-12 |
| 5. SMS Integration | v1.0 | 2/2 | Complete | 2026-01-13 |
| 6. Analytics Dashboard | v1.0 | 3/3 | Complete | 2026-01-13 |
| 7. Mobile Polish | v1.0 | 3/3 | Complete | 2026-01-14 |
| 8. UI Overhaul | v1.0 | 3/3 | Complete | 2026-01-14 |
| **8.1. Wants Budget (URGENT)** | Finance | 4/4 | Complete | 2026-01-15 |
| **8.2. Navigation System (URGENT)** | UX | 3/3 | Complete | 2026-01-19 |
| 9. Skincare Schema | v1.1 | 1/1 | DEPRECATED | 2026-01-15 |
| 10. Settings UI | v1.1 | 2/2 | DEPRECATED | 2026-01-15 |
| 11. Scheduler Setup | v1.1 | 2/2 | DEPRECATED | 2026-01-15 |
| 12. SMS Reminders | v1.1 | - | REMOVED | - |
| 13. Polish & Edge Cases | v1.1 | - | REMOVED | - |
| **9.1. Routine Schema** | v1.1 | 1/1 | Complete | 2026-01-19 |
| **9.2. Routine Management UI** | v1.1 | 0/2 | Ready | - |
| **9.3. Routine Display View** | v1.1 | 0/? | Not started | - |
