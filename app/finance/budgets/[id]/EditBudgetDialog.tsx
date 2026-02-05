'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { updateBudget } from '../actions'
import type { Tables } from '@/lib/database.types'

type Budget = Tables<'budgets'>

interface EditBudgetDialogProps {
    budget: Budget
    onClose: () => void
}

function formatMonth(monthString: string): string {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function EditBudgetDialog({ budget, onClose }: EditBudgetDialogProps) {
    const router = useRouter()
    const [month, setMonth] = useState(budget.month)
    const [totalBudget, setTotalBudget] = useState(budget.total_budget.toString())
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        const budgetAmount = parseFloat(totalBudget)
        if (isNaN(budgetAmount)) {
            setError('Please enter a valid budget amount.')
            setIsLoading(false)
            return
        }

        const result = await updateBudget(budget.id, month, budgetAmount)

        if (result.success) {
            router.refresh()
            onClose()
        } else {
            setError(result.error || 'Failed to update budget.')
            setIsLoading(false)
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Budget</DialogTitle>
                    <DialogDescription>
                        Update the budget for {formatMonth(budget.month)}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="month" className="text-sm font-medium text-foreground">
                                Month
                            </label>
                            <input
                                id="month"
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="totalBudget" className="text-sm font-medium text-foreground">
                                Total Budget
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    $
                                </span>
                                <input
                                    id="totalBudget"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={totalBudget}
                                    onChange={(e) => setTotalBudget(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
