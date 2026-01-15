# Roadmap: Personal Nexus

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-8) — SHIPPED 2026-01-14
- 🚧 **v1.1 Skincare Module** - Phases 9-14 (in progress)

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

### 🚧 v1.1 Skincare Module (In Progress)

**Milestone Goal:** Add comprehensive skincare tracking with product catalog, routine management, application logging, and progress analytics with photo tracking.

#### Phase 9: Skincare Foundation

**Goal**: Establish database schema for products, routines, and application logs with Supabase backend
**Depends on**: v1.0 complete
**Research**: Unlikely (established Supabase patterns from Finance module)
**Plans**: TBD

Plans:
- [ ] 09-01: TBD (run /gsd:plan-phase 9 to break down)

#### Phase 10: Product Management

**Goal**: Build product catalog UI with ingredient tracking, search, and product details
**Depends on**: Phase 9
**Research**: Unlikely (CRUD operations with existing patterns)
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

#### Phase 11: Routine Builder

**Goal**: Create morning/evening routine builder with product scheduling and ordering
**Depends on**: Phase 10
**Research**: Unlikely (internal UI building on Phase 9/10 patterns)
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

#### Phase 12: Application Tracking

**Goal**: Implement quick-log interface for tracking daily product usage
**Depends on**: Phase 11
**Research**: Unlikely (similar to Finance transaction logging patterns)
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

#### Phase 13: Skin Analytics

**Goal**: Create progress photo upload/storage, skin condition tracking, and trend visualization
**Depends on**: Phase 12
**Research**: Likely (new Supabase Storage integration for images)
**Research topics**: Supabase Storage for progress photos, image optimization for web, photo comparison UI patterns, before/after timeline visualizations
**Plans**: TBD

Plans:
- [ ] 13-01: TBD

#### Phase 14: Skincare Polish

**Goal**: Mobile UX refinement, notification reminders for routine adherence, and performance tuning
**Depends on**: Phase 13
**Research**: Unlikely (mobile polish following Finance Phase 7 patterns)
**Plans**: TBD

Plans:
- [ ] 14-01: TBD

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
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14

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
| 9. Skincare Foundation | v1.1 | 0/? | Not started | - |
| 10. Product Management | v1.1 | 0/? | Not started | - |
| 11. Routine Builder | v1.1 | 0/? | Not started | - |
| 12. Application Tracking | v1.1 | 0/? | Not started | - |
| 13. Skin Analytics | v1.1 | 0/? | Not started | - |
| 14. Skincare Polish | v1.1 | 0/? | Not started | - |
