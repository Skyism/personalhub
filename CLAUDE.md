# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Nexus is a modular personal dashboard for tracking life metrics across multiple domains. The Finance module is the v1 MVP, providing budget tracking, transaction logging via SMS, and spending analytics. Future modules will cover Skincare and Fitness tracking.

## Commands

**Development:**
```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

**Environment Setup:**
Copy `.env.local.example` to `.env.local` and fill in your values for Supabase and Twilio.

## Architecture

**Tech Stack:**
- Next.js 16+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Supabase (backend/database)
- Twilio (SMS integration)

**Modular Structure:**

Personal Nexus uses a feature-based module architecture with top-level folders in `/app`:

```
app/
├── finance/     # Finance module (v1 MVP) - Budget tracking, SMS expense logging
├── skincare/    # Skincare module (future) - Routine and product tracking
├── fitness/     # Fitness module (future) - Workout and health tracking
├── layout.tsx   # Root layout
└── page.tsx     # Landing page
```

**Key Principles:**
- Each module is self-contained in its own `/app/[module]` folder
- Finance is v1; Skincare and Fitness are future phases
- Modules are independent and can be developed without affecting others
- Mobile-first design (primary use case is on-the-go expense logging)

## Conventions

**TypeScript:**
- Strict mode enabled
- Use explicit types for function parameters and returns
- Prefer interfaces for object shapes

**Styling:**
- Tailwind CSS for all styling
- Use Tailwind utilities, avoid custom CSS when possible
- Mobile-first responsive design approach

**Module Structure:**
- Feature folders are self-contained with their own routes and components
- Shared utilities go in top-level directories (lib/, components/, etc.)
- Each module handles its own state management and API calls

**Database:**
- Supabase Postgres for relational data (budgets, transactions, categories)
- Row Level Security (RLS) policies for single-user access control

**API Routes:**
- Next.js API routes in `/app/api` for server-side logic
- Twilio webhook handlers for SMS integration
