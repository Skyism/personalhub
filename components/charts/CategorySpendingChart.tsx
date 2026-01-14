'use client'

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import ChartWrapper from './ChartWrapper'
import { useEffect, useState } from 'react'

type CategoryData = {
  name: string
  value: number // amount spent
  color: string | null
}

type CategorySpendingChartProps = {
  data: CategoryData[]
}

// Fallback color palette for categories without colors
const FALLBACK_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#8b5cf6', // purple-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#14b8a6', // teal-500
  '#a855f7', // violet-500
]

// Format currency for tooltip
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function CategorySpendingChart({ data }: CategorySpendingChartProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter out categories with no spending
  const chartData = data.filter(item => item.value > 0)

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No spending data yet
      </div>
    )
  }

  // Assign colors to data
  const dataWithColors = chartData.map((item, index) => ({
    ...item,
    displayColor: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  }))

  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  // Custom label showing percentage
  const renderLabel = (entry: any) => {
    const percent = (entry.value / total) * 100
    return `${entry.name}: ${percent.toFixed(0)}%`
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-muted-foreground">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <ChartWrapper height={400}>
      <PieChart>
        <Pie
          data={dataWithColors}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? 80 : 100}
          label={renderLabel}
          labelLine={true}
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.displayColor} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry: any) => (
            <span className="text-sm text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ChartWrapper>
  )
}
