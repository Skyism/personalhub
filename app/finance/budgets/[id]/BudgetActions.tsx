'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EditBudgetDialog } from './EditBudgetDialog'
import { DeleteBudgetDialog } from './DeleteBudgetDialog'
import type { Tables } from '@/lib/database.types'

type Budget = Tables<'budgets'>

interface BudgetActionsProps {
    budget: Budget
}

export function BudgetActions({ budget }: BudgetActionsProps) {
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    return (
        <>
            <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEditDialog(true)}
                >
                    Edit Budget
                </Button>
                <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    Delete Budget
                </Button>
            </div>

            {showEditDialog && (
                <EditBudgetDialog
                    budget={budget}
                    onClose={() => setShowEditDialog(false)}
                />
            )}

            {showDeleteDialog && (
                <DeleteBudgetDialog
                    budget={budget}
                    onClose={() => setShowDeleteDialog(false)}
                />
            )}
        </>
    )
}
