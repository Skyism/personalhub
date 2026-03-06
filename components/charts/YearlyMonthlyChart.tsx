'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import ChartWrapper from './ChartWrapper'

export type MonthlyDatum = {
  month: number
  monthLabel: string
  amount: number
}

interface YearlyMonthlyChartProps {
  data: MonthlyDatum[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function YearlyMonthlyChart({ data }: YearlyMonthlyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data
      </div>
    )
  }

  const hasAnyAmount = data.some((d) => d.amount > 0)
  if (!hasAnyAmount) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No spending in this year
      </div>
    )
  }

  return (
    <ChartWrapper height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="monthLabel"
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          width={60}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          stroke="var(--muted-foreground)"
        />
        <Tooltip
          formatter={(value: unknown) => formatCurrency(value as number)}
          labelFormatter={(label) => label}
        />
        <Bar
          dataKey="amount"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
          name="Spent"
        />
      </BarChart>
    </ChartWrapper>
  )
}
