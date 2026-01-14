'use client'

import dynamic from 'next/dynamic'

// Dynamic imports for charts to reduce initial bundle size
// Charts use Recharts (~100KB gzipped) - defer loading until needed
const CategorySpendingChart = dynamic(
  () => import('@/components/charts/CategorySpendingChart'),
  {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[400px]" />
  }
)

const SpendingTrendsChart = dynamic(
  () => import('@/components/charts/SpendingTrendsChart'),
  {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[300px]" />
  }
)

const BudgetComparisonChart = dynamic(
  () => import('@/components/charts/BudgetComparisonChart'),
  {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[300px]" />
  }
)

// Simple skeleton for chart loading
function ChartSkeleton({ height }: { height: string }) {
  return (
    <div className={`${height} bg-gray-200 rounded animate-pulse`} />
  )
}

type CategoryData = {
  name: string
  value: number
  color: string | null
}

type DailySpending = {
  date: string
  amount: number
  formattedDate: string
}

type CategoryComparison = {
  category: string
  budgeted: number
  spent: number
  color: string | null
}

type AnalyticsChartsProps = {
  categoryData: CategoryData[]
  dailyData: DailySpending[]
  comparisonData: CategoryComparison[]
  budgetTotal: number
}

export default function AnalyticsCharts({
  categoryData,
  dailyData,
  comparisonData,
  budgetTotal
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Spending - Full width on mobile, left column on desktop */}
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Category Spending</h2>
        <CategorySpendingChart data={categoryData} />
      </div>

      {/* Budget vs Actual - Full width on mobile, right column on desktop */}
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Budget vs Actual</h2>
        <BudgetComparisonChart data={comparisonData} />
      </div>

      {/* Spending Trends - Full width on both mobile and desktop */}
      <div className="bg-card rounded-lg shadow p-6 lg:col-span-2">
        <h2 className="text-xl font-bold text-foreground mb-4">Spending Trends</h2>
        <SpendingTrendsChart data={dailyData} budgetTotal={budgetTotal} />
      </div>
    </div>
  )
}
