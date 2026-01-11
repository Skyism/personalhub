# Phase 2: Supabase Backend - Discovery

**Research Level**: Standard (15-30 min)
**Completed**: 2026-01-11

## Research Questions

1. How to set up Supabase client in Next.js App Router?
2. What database schema design is optimal for budgets/transactions/categories?
3. How to implement Row Level Security for single-user access?

## Findings

### 1. Supabase Client Setup in Next.js 16+

**Dependencies Required:**
- `@supabase/supabase-js` - Core Supabase client
- `@supabase/ssr` - Server-Side Auth package for Next.js

**Architecture Pattern:**
Next.js requires **two separate client types**:
1. **Browser Client** (`lib/supabase/client.ts`) - For Client Components
2. **Server Client** (`lib/supabase/server.ts`) - For Server Components, Server Actions, and Route Handlers

**Key Configuration:**
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or new `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- Middleware/Proxy required to refresh auth tokens for Server Components (cannot write cookies)
- Server client uses `cookies()` from `next/headers` to handle session

**Standard Lib Utilities:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore - Server Components can't write cookies
          }
        },
      },
    }
  )
}
```

### 2. Database Schema Design

**Recommended Tables:**

**`profiles` table:**
- Links to `auth.users(id)` via foreign key
- Stores user-specific display info (not critical for v1, can defer)

**`budgets` table:**
- `id` (bigint, primary key, identity)
- `user_id` (uuid, references auth.users)
- `month` (text or date) - "2024-01" format or date
- `total_budget` (numeric/decimal for currency)
- `created_at` (timestamptz)
- Unique constraint on (user_id, month)

**`categories` table:**
- `id` (bigint, primary key, identity)
- `user_id` (uuid, references auth.users)
- `name` (text) - "Groceries", "Gas", "Dining", etc.
- `budget_id` (bigint, references budgets) - optional, for per-category budgets
- `allocated_amount` (numeric/decimal) - optional, for category-specific budgets
- `created_at` (timestamptz)

**`transactions` table:**
- `id` (bigint, primary key, identity)
- `user_id` (uuid, references auth.users)
- `budget_id` (bigint, references budgets)
- `category_id` (bigint, references categories, nullable)
- `amount` (numeric/decimal)
- `note` (text, nullable)
- `transaction_date` (timestamptz, default now())
- `created_at` (timestamptz)
- `source` (text) - "manual", "sms", etc. (for tracking entry method)

**Key Design Decisions:**
- Use `numeric` or `decimal` types for currency (NOT float/real - precision issues)
- Use `timestamptz` for all timestamps (timezone-aware)
- Foreign keys enforce referential integrity
- Index foreign keys for join performance (best practice per Supabase Advisor Lint 0001)

**Indexes to Create:**
```sql
create index ix_transactions_user_id on transactions(user_id);
create index ix_transactions_budget_id on transactions(budget_id);
create index ix_transactions_category_id on transactions(category_id);
create index ix_categories_user_id on categories(user_id);
create index ix_budgets_user_id on budgets(user_id);
```

### 3. Row Level Security (RLS) Implementation

**Core Principle:**
Single-user app = user can only access their own data

**RLS Pattern for Each Table:**
```sql
alter table [table_name] enable row level security;

-- Read policy
create policy "Users can view their own [resource]"
  on [table_name] for select
  using ((select auth.uid()) = user_id);

-- Insert policy
create policy "Users can create their own [resource]"
  on [table_name] for insert
  with check ((select auth.uid()) = user_id);

-- Update policy
create policy "Users can update their own [resource]"
  on [table_name] for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Delete policy
create policy "Users can delete their own [resource]"
  on [table_name] for delete
  using ((select auth.uid()) = user_id);
```

**Best Practices:**
- Always enable RLS on user-facing tables
- Use `auth.uid()` to get current authenticated user
- Separate policies for SELECT/INSERT/UPDATE/DELETE for clarity
- Use `with check` on INSERT/UPDATE to prevent users from creating rows for other users
- Can combine policies (e.g., single policy for all operations) but separate is clearer

**Testing RLS:**
- Use `tests.create_supabase_user()` and `tests.authenticate_as()` from test helpers
- Verify users cannot see/modify other users' data
- Test with service role to bypass RLS for debugging

## Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Supabase Client Package | `@supabase/ssr` | Official Next.js App Router support with SSR helpers |
| Client Architecture | Dual clients (browser + server) | Next.js requirement - Server Components can't write cookies |
| Currency Type | `numeric` or `decimal` | Avoid float precision issues with money |
| Timestamp Type | `timestamptz` | Timezone-aware for accurate time tracking |
| RLS Strategy | Per-user isolation via `auth.uid()` | Single-user app - simplest and most secure |
| Index Strategy | Index all foreign keys | Best practice per Supabase Advisor, improves join performance |

## Common Pitfalls (Avoided)

1. **Using float for currency** → Use numeric/decimal for exact precision
2. **Forgetting to index foreign keys** → Creates slow joins at scale
3. **Not enabling RLS** → Security vulnerability, data leakage
4. **Using `getSession()` in server code** → Unreliable, use `getUser()` or `getClaims()` instead
5. **Mixing up client types** → Browser client for Client Components only, server client for Server Components
6. **Hardcoding Supabase credentials** → Use environment variables (`NEXT_PUBLIC_*` for browser, regular for server)

## Code Examples

### Environment Variables (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Migration Example (budgets table)
```sql
create table budgets (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,
  total_budget numeric(10,2) not null,
  created_at timestamptz default now(),
  constraint unique_user_month unique (user_id, month)
);

-- Index foreign key
create index ix_budgets_user_id on budgets(user_id);

-- Enable RLS
alter table budgets enable row level security;

-- RLS policies
create policy "Users can view their own budgets"
  on budgets for select
  using ((select auth.uid()) = user_id);

create policy "Users can create their own budgets"
  on budgets for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own budgets"
  on budgets for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

## Next Steps for Planning

1. **Create Supabase client utilities** (lib/supabase/client.ts, lib/supabase/server.ts)
2. **Write database migration** (budgets, categories, transactions tables with RLS)
3. **Generate TypeScript types** from schema
4. **Test RLS policies** with test users

## References

- [Supabase Next.js SSR Guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Row Level Security Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Foreign Key Indexing Best Practice](https://supabase.com/docs/guides/database/database-advisors?lint=0001_unindexed_foreign_keys)
- [Database Tables Guide](https://supabase.com/docs/guides/database/tables)

---

**Discovery Complete** - Ready for phase planning.
