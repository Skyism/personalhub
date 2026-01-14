'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import type { Tables } from '@/lib/database.types'

type Budget = Tables<'budgets'>

function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

type BudgetListProps = {
  budgets: Budget[]
}

export default function BudgetList({ budgets }: BudgetListProps) {
  return (
    <motion.div
      className="grid gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {budgets.map((budget) => (
        <motion.div key={budget.id} variants={item}>
          <Link href={`/finance/budgets/${budget.id}`}>
            <Card className="bg-muted hover:bg-muted/80 transition-colors p-6 border-border cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {formatMonth(budget.month)}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Created {new Date(budget.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {formatCurrency(budget.total_budget)}
                  </p>
                  <p className="text-muted-foreground text-sm">Total Budget</p>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
