import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'
import BudgetList from './BudgetList'
import { Card } from '@/components/ui/card'
import TopAppBar from '@/components/navigation/TopAppBar'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

type Budget = Tables<'budgets'>

export default async function BudgetsPage() {
  const supabase = await createClient()

  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', TEMP_USER_ID)
    .order('month', { ascending: false })

  if (error) {
    console.error('Error fetching budgets:', error)
  }

  const hasBudgets = budgets && budgets.length > 0

  return (
    <>
      <TopAppBar fallbackHref="/finance" />
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
            <p className="text-muted-foreground mt-1">Manage your monthly budgets</p>
          </div>
          <Link
            href="/finance/budgets/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Create Budget
          </Link>
        </div>

        {!hasBudgets ? (
          <Card className="bg-muted/50 border-border p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No budgets yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first budget to track your monthly spending.
              </p>
              <Link
                href="/finance/budgets/new"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Create Your First Budget
              </Link>
            </div>
          </Card>
        ) : (
          <BudgetList budgets={budgets} />
        )}
        </div>
      </div>
    </>
  )
}
