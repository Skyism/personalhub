# Roadmap: Personal Nexus

## Overview

Personal Nexus delivers a modular personal dashboard with SMS-first expense tracking. The journey starts with foundational Next.js architecture supporting future modules, builds the Supabase backend and budget management core, implements manual transaction entry, adds the critical SMS logging integration via Twilio, provides spending analytics and visualization, and finishes with mobile-responsive polish for on-the-go usage.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Next.js project setup with modular architecture
- [ ] **Phase 2: Supabase Backend** - Database schema and API integration
- [ ] **Phase 3: Budget Management** - Budget creation and category management UI
- [ ] **Phase 4: Transaction System** - Manual transaction entry and display
- [ ] **Phase 5: SMS Integration** - Twilio webhook for SMS expense logging
- [ ] **Phase 6: Analytics Dashboard** - Charts and spending visualization
- [ ] **Phase 7: Mobile Polish** - Mobile-responsive optimization and UX refinement

## Phase Details

### Phase 1: Foundation
**Goal**: Establish Next.js project with modular architecture and base layout
**Depends on**: Nothing (first phase)
**Research**: Unlikely (Next.js project setup with established patterns)
**Plans**: TBD

Plans:
- TBD (determined during phase planning)

### Phase 2: Supabase Backend
**Goal**: Set up Supabase client, create database schema for budgets/transactions/categories, establish API integration patterns
**Depends on**: Phase 1
**Research**: Likely (new integration, database design)
**Research topics**: Supabase client setup in Next.js, schema design for budgets/transactions/categories with proper relationships, Row Level Security policies for single-user app
**Plans**: TBD

Plans:
- TBD (determined during phase planning)

### Phase 3: Budget Management
**Goal**: Build UI for creating monthly budgets with total and per-category allocations
**Depends on**: Phase 2
**Research**: Unlikely (internal UI building on Phase 2 patterns)
**Plans**: TBD

Plans:
- TBD (determined during phase planning)

### Phase 4: Transaction System
**Goal**: Implement transaction list display and manual entry form with category assignment
**Depends on**: Phase 3
**Research**: Unlikely (CRUD operations with established Supabase patterns)
**Plans**: TBD

Plans:
- TBD (determined during phase planning)

### Phase 5: SMS Integration
**Goal**: Integrate Twilio webhook to parse "amount category note" SMS messages and create transactions
**Depends on**: Phase 4
**Research**: Likely (external API integration)
**Research topics**: Twilio webhook setup with Next.js API routes, SMS text parsing strategies for flexible input, webhook authentication and security best practices
**Plans**: TBD

Plans:
- TBD (determined during phase planning)

### Phase 6: Analytics Dashboard
**Goal**: Create spending visualization with category breakdowns, trends, and budget vs actual charts
**Depends on**: Phase 4 (can run parallel to Phase 5 if needed)
**Research**: Likely (charting library selection)
**Research topics**: Chart.js vs Recharts vs Tremor for React/Next.js, efficient aggregation queries for spending data in Supabase
**Plans**: TBD

Plans:
- TBD (determined during phase planning)

### Phase 7: Mobile Polish
**Goal**: Optimize mobile experience with responsive layouts, touch targets, and performance tuning
**Depends on**: Phases 5 and 6 (final polish after core features complete)
**Research**: Unlikely (Tailwind responsive patterns)
**Plans**: TBD

Plans:
- TBD (determined during phase planning)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Supabase Backend | 0/TBD | Not started | - |
| 3. Budget Management | 0/TBD | Not started | - |
| 4. Transaction System | 0/TBD | Not started | - |
| 5. SMS Integration | 0/TBD | Not started | - |
| 6. Analytics Dashboard | 0/TBD | Not started | - |
| 7. Mobile Polish | 0/TBD | Not started | - |
