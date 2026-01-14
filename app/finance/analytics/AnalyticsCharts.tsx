'use client'

import dynamic from 'next/dynamic'
import { motion } from 'motion/react'

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
    <div className={`${height} bg-muted/50 rounded animate-pulse`} />
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
  const charts = [
    {
      title: 'Category Spending',
      component: <CategorySpendingChart data={categoryData} />,
      className: ''
    },
    {
      title: 'Budget vs Actual',
      component: <BudgetComparisonChart data={comparisonData} />,
      className: ''
    },
    {
      title: 'Spending Trends',
      component: <SpendingTrendsChart data={dailyData} budgetTotal={budgetTotal} />,
      className: 'lg:col-span-2'
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {charts.map((chart, index) => (
        <motion.div
          key={chart.title}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.1 }}
          className={`bg-muted/50 backdrop-blur-sm border border-border rounded-lg shadow p-6 ${chart.className}`}
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
            className="text-xl font-bold text-foreground mb-4"
          >
            {chart.title}
          </motion.h2>
          {chart.component}
        </motion.div>
      ))}
    </div>
  )
}
