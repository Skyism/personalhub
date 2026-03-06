# Product Requirements Document (PRD)
## Feature: Yearly Spending Analytics

| Field | Value |
|-------|--------|
| **Owner** | Jeffrey Shen |
| **Status** | Draft |
| **Target User** | Primary: Me (single-user personal app) |
| **Placement** | Finance → Analytics (new view/section) |

---

## 1. Problem Statement

I track spending per monthly budget and see category breakdown and daily trends for a single month. I have no way to answer: “How much did I spend in 2024 (or 2025) in total and by category?” or “How did my spending change month-over-month across the year?” A yearly view would support reflection, tax/planning, and spotting annual patterns.

---

## 2. Goals & Success Criteria

**Goals**

- Show **yearly statistics**: total spent in a selected year and per-category totals for that year.
- **Graph spending** over the year (e.g. by month or by category over time).
- Reuse existing analytics patterns (Recharts, Tokyo Night, mobile-first) and data (transactions + categories).

**Success Criteria**

- User can select a year and see:
  - Total amount spent in that year.
  - Per-category spending for that year (table and/or chart).
- At least one spending graph (e.g. monthly total over the year, or category breakdown for the year).
- View lives on a separate route with a link from Finance → Analytics.
- No new backend tables; aggregate from existing `transactions` + `categories` (and budgets only for context).

---

## 3. Non-Goals (Out of Scope for v1)

- Multi-year comparison (e.g. 2024 vs 2025) — single-year view only.
- Year-over-year % change or forecasts.
- Export (CSV/PDF).
- Wants/trip-specific yearly view — scope to monthly-budget transactions only.
- Changing how monthly (budget-scoped) analytics works — additive only.

---

## 4. User Stories

**Core**

- As a user, I want to pick a year and see my total spending for that year so I can understand annual spend.
- As a user, I want to see how much I spent per category in that year so I can see which categories dominate.
- As a user, I want a chart of spending over the year (e.g. by month) so I can see trends and spikes.

**Optional / Nice-to-have**

- As a user, I want to switch between “by month” and “by category” visualization for the year.
- As a user, I want the year selector to only list years that have transaction data.

---

## 5. Functional Requirements

### 5.1 Year selection

- User can select a calendar year (e.g. 2024, 2025).
- Default: current year, or latest year that has transactions.
- Only years with at least one transaction need to be available (no need to show empty years).

### 5.2 Yearly totals

- **Total spent**: Sum of all transaction amounts for the selected year (transactions where `transaction_date` falls in that year), for the current user (TEMP_USER_ID until auth).
- **Per-category spent**: Same sum grouped by `category_id`, with category name and optional color from `categories`.
- Transactions with null `category_id` are shown as a separate **Uncategorized** row in the category breakdown and included in the total.

### 5.3 Spending graph

- One chart for the selected year: **monthly total** — X = months (Jan–Dec), Y = total spent that month.
- Chart must be responsive and follow existing analytics styling (Recharts, ChartWrapper, design system).

### 5.4 Data source

- Source: `transactions` joined with `categories` (and `budgets` only if needed for filtering).
- Scope: All budgets for the user; filter by `transaction_date` within the selected year.
- No new tables or migrations required; read-only aggregations.

### 5.5 Placement in Analytics

- Yearly analytics live on a **separate route** (e.g. `/finance/analytics/yearly`).
- The main Analytics page (`/finance/analytics`) includes a **link** to the yearly view (e.g. "View yearly spending" or "Yearly").
- Clear separation from "this month's budget" view so users don't confuse budget-scoped vs year-scoped data.

---

## 6. Non-Functional Requirements

- **Performance:** Yearly aggregation should complete in &lt; 2s for typical data (e.g. &lt; 10k transactions/year).
- **Consistency:** Currency and number formatting consistent with rest of Finance (e.g. existing analytics and budget pages).
- **Mobile:** Layout and charts usable on small screens (same standards as current analytics).

---

## 7. Data Model (no schema change)

- **Existing:** `transactions` (id, user_id, budget_id, category_id, amount, transaction_date, …), `categories` (id, user_id, name, color), `budgets` (id, user_id, month, …).
- **Yearly query pattern:** For selected year Y, filter transactions where `transaction_date >= Y-01-01` and `transaction_date < (Y+1)-01-01`, then SUM(amount) overall and GROUP BY category_id with JOIN to categories.
- **Monthly series:** Same filter, then GROUP BY month (extract from transaction_date) for the 12 points.

---

## 8. UX / UI Requirements

- **Entry:** Link from Finance → Analytics to yearly view (e.g. "View yearly spending" or "Yearly").
- **Year selector:** Dropdown or control to choose year; default = current year or latest with data.
- **Summary block:** Prominent total spent for the year; optional secondary line (e.g. “X transactions”).
- **Category breakdown:** Table and/or list of category totals including **Uncategorized**; reuse category colors where available.
- **Spending graph:** One chart — monthly spending (Jan–Dec) for the selected year; labeled axes, responsive.
- **Empty state:** If selected year has no transactions, show message and no charts.

---

## 9. Edge Cases

- **No data for year:** Show “No transactions in {year}” and hide or disable charts.
- **Partial year:** Only months with data are shown in monthly chart (no need to show zeros for future months in current year).
- **Uncategorized transactions:** Shown as "Uncategorized" in the category breakdown and included in total.
- **Timezone:** Use same transaction_date semantics as rest of app (e.g. date part only for “year” boundary).

---

## 10. Future Enhancements

- Multi-year comparison (side-by-side or overlay).
- Year-over-year % change and simple projections.
- Export yearly summary (CSV/PDF).
- Include wants/trip transactions in a separate section or filter.
- Drill-down: click month → see that month’s budget or transactions.

---

## 11. GSD Alignment

- **Phase:** To be inserted or added as sub-phase under Analytics (e.g. after current Phase 8.3 or as “Phase 6.1”).
- **Plans:** Can be split into: (1) Data: yearly aggregation API/query + types, (2) UI: year selector + summary + charts, (3) Polish: empty states, responsive, accessibility.
- **Dependencies:** Existing analytics page, Recharts, transactions/categories schema. No auth or new tables.
- **Acceptance:** User can select a year and see total spent, category breakdown (including Uncategorized), and one monthly spending chart.
