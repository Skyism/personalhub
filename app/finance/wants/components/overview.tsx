'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WantsBudgetForm } from './budget-form';
import { TransactionList } from './transaction-list';
import { TransactionForm } from './transaction-form';
import { DeleteDialog } from './delete-dialog';
import type { WantsPeriod } from '@/lib/wants/periods';

interface WantsTransaction {
  id: number;
  amount: number;
  note: string | null;
  transaction_date: string;
  source: 'sms' | 'manual';
  created_at: string;
}

interface WantsOverviewProps {
  budget: {
    id: number;
    total_amount: number;
    period_start: string;
    period_end: string;
  };
  totalSpent: number;
  period: WantsPeriod;
  transactions: WantsTransaction[];
}

export function WantsOverview({ budget, totalSpent, period, transactions }: WantsOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<WantsTransaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<WantsTransaction | null>(null);

  const totalAmount = Number(budget.total_amount);
  const remaining = totalAmount - totalSpent;
  const progressPercentage = (totalSpent / totalAmount) * 100;

  // Color coding: <80% green, 80-100% yellow, >100% red
  let statusColor = 'text-green-600 dark:text-green-400';
  let progressBarColor = 'bg-green-600';

  if (progressPercentage >= 100) {
    statusColor = 'text-red-600 dark:text-red-400';
    progressBarColor = 'bg-red-600';
  } else if (progressPercentage >= 80) {
    statusColor = 'text-yellow-600 dark:text-yellow-400';
    progressBarColor = 'bg-yellow-600';
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <WantsBudgetForm
          period={period}
          existingBudget={{
            id: budget.id,
            total_amount: totalAmount,
          }}
        />
        <Button
          variant="outline"
          onClick={() => setIsEditing(false)}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Overview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9"
            >
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Amount */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
            <p className="text-4xl font-mono font-bold">
              ${totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-medium ${statusColor}`}>
                {Math.min(progressPercentage, 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${progressBarColor} transition-all duration-500`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Spending Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className={`text-2xl font-mono font-semibold ${statusColor}`}>
                ${totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-mono font-semibold ${remaining >= 0 ? 'text-foreground' : statusColor}`}>
                ${Math.abs(remaining).toFixed(2)}
                {remaining < 0 && ' over'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Button */}
      <Button
        onClick={() => setIsAddingTransaction(true)}
        className="w-full h-11"
        size="lg"
      >
        Add Transaction
      </Button>

      {/* Transaction List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>
        <TransactionList
          transactions={transactions}
          onEdit={(transaction) => setEditingTransaction(transaction)}
          onDelete={(transaction) => setDeletingTransaction(transaction)}
        />
      </div>

      {/* Transaction Form Dialog */}
      {(isAddingTransaction || editingTransaction) && (
        <TransactionForm
          budgetId={budget.id}
          transaction={editingTransaction}
          onClose={() => {
            setIsAddingTransaction(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTransaction && (
        <DeleteDialog
          transaction={deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
        />
      )}
    </div>
  );
}
