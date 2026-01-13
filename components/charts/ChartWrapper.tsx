'use client'

import { ResponsiveContainer } from 'recharts'
import { ReactNode } from 'react'

interface ChartWrapperProps {
  children: ReactNode
  height?: number
  className?: string
}

export default function ChartWrapper({
  children,
  height = 300,
  className = ''
}: ChartWrapperProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}
