'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts'
import ChartWrapper from './ChartWrapper'

type CategoryComparison = {
  category: string
  budgeted: number // allocated_amount
  spent: number // actual spending
  color: string | null // category color
}

interface BudgetComparisonChartProps {
  data: CategoryComparison[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

// Custom tooltip to show percentage and details
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload as CategoryComparison
  const percentage = data.budgeted > 0 ? (data.spent / data.budgeted * 100).toFixed(0) : '0'

  return (
    <div className="bg-card p-3 border border-border rounded shadow-md">
      <p className="font-semibold text-foreground mb-2">{data.category}</p>
      <p className="text-sm text-muted-foreground">
        Spent: {formatCurrency(data.spent)}
      </p>
      <p className="text-sm text-muted-foreground">
        Budgeted: {formatCurrency(data.budgeted)}
      </p>
      <p className="text-sm font-medium text-foreground mt-1">
        {percentage}% used
      </p>
    </div>
  )
}

// Determine bar color based on spending status
const getSpentColor = (spent: number, budgeted: number): string => {
  if (budgeted === 0) return '#10B981' // green-500 (healthy)

  const percentage = spent / budgeted

  if (percentage > 1) return '#EF4444' // red-500 (over budget)
  if (percentage >= 0.8) return '#F59E0B' // yellow-500 (nearing limit)
  return '#10B981' // green-500 (healthy)
}

export default function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No budget allocations yet
      </div>
    )
  }

  // Sort by budgeted amount descending (highest budget first)
  const sortedData = [...data].sort((a, b) => b.budgeted - a.budgeted)

  // Dynamic height based on category count (minimum 300px)
  const chartHeight = Math.max(300, sortedData.length * 60)

  return (
    <ChartWrapper height={chartHeight}>
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          type="category"
          dataKey="category"
          width={100}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          stroke="var(--muted-foreground)"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '10px' }}
          iconType="rect"
        />
        <Bar
          dataKey="budgeted"
          fill="#E5E7EB"
          name="Budgeted"
          barSize={20}
        />
        <Bar
          dataKey="spent"
          name="Spent"
          barSize={20}
        >
          {sortedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getSpentColor(entry.spent, entry.budgeted)}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartWrapper>
  )
}
