'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteBudget } from '../actions'
import type { Tables } from '@/lib/database.types'

type Budget = Tables<'budgets'>

interface DeleteBudgetDialogProps {
    budget: Budget
    onClose: () => void
}

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

export function DeleteBudgetDialog({ budget, onClose }: DeleteBudgetDialogProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const result = await deleteBudget(budget.id)

            if (result.success) {
                // Redirect to budgets list after successful deletion
                router.push('/finance/budgets')
                router.refresh()
            } else {
                console.error('Failed to delete budget:', result.error)
                // Keep dialog open on error so user can try again
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Unexpected error deleting budget:', error)
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            Are you sure you want to delete the budget for{' '}
                            <strong>{formatMonth(budget.month)}</strong> with a total of{' '}
                            <strong>{formatCurrency(budget.total_budget)}</strong>?
                        </p>
                        <p className="text-destructive font-semibold">
                            Warning: This will also delete all associated transactions and category
                            allocations. This action cannot be undone.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? 'Deleting...' : 'Delete Budget'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
