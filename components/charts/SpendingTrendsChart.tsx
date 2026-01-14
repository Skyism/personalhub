'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts'
import ChartWrapper from './ChartWrapper'

type DailySpending = {
  date: string // YYYY-MM-DD format
  amount: number
  formattedDate: string // "Jan 12" format for display
}

interface SpendingTrendsChartProps {
  data: DailySpending[]
  budgetTotal?: number // optional line showing daily budget limit
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function SpendingTrendsChart({ data, budgetTotal }: SpendingTrendsChartProps) {
  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No transactions yet
      </div>
    )
  }

  // Sort data by date ascending for chronological display
  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date))

  // Calculate daily budget if budgetTotal is provided
  const dailyBudget = budgetTotal ? budgetTotal / 30 : undefined

  return (
    <ChartWrapper height={300}>
      <LineChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="formattedDate"
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          stroke="var(--muted-foreground)"
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatCurrency}
          width={60}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          stroke="var(--muted-foreground)"
        />
        <Tooltip
          formatter={(value: any) => formatCurrency(value as number)}
          labelFormatter={(label) => label}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="var(--chart-1)"
          strokeWidth={2}
          name="Daily Spending"
          dot={{ fill: 'var(--chart-1)', r: 4 }}
          activeDot={{ r: 6 }}
        />
        {dailyBudget && (
          <ReferenceLine
            y={dailyBudget}
            stroke="var(--muted-foreground)"
            strokeDasharray="5 5"
            label={{ value: 'Daily Budget', position: 'right', fill: 'var(--muted-foreground)' }}
          />
        )}
      </LineChart>
    </ChartWrapper>
  )
}
