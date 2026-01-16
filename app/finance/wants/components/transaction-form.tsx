'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWantsTransaction, updateWantsTransaction } from '../actions';

interface WantsTransaction {
  id: number;
  amount: number;
  note: string | null;
  transaction_date: string;
  source: 'sms' | 'manual';
  created_at: string;
}

interface TransactionFormProps {
  budgetId: number;
  transaction?: WantsTransaction | null;
  onClose: () => void;
}

export function TransactionForm({ budgetId, transaction, onClose }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState(transaction?.amount.toString() ?? '');
  const [note, setNote] = useState(transaction?.note ?? '');
  const [transactionDate, setTransactionDate] = useState(
    transaction?.transaction_date ?? new Date().toISOString().split('T')[0]
  );

  const isEditMode = !!transaction;

  // Get today's date for max validation
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (transactionDate > today) {
      setError('Cannot add future transactions');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode) {
        await updateWantsTransaction(
          transaction.id,
          amountNum,
          note.trim() || null,
          transactionDate
        );
      } else {
        await createWantsTransaction(
          budgetId,
          amountNum,
          note.trim() || null,
          transactionDate
        );
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 font-mono h-11"
                  placeholder="0.00"
                  required
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-11"
                placeholder="What did you spend on?"
                autoComplete="off"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                max={today}
                className="h-11"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
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
              {isLoading
                ? 'Saving...'
                : isEditMode
                ? 'Save Changes'
                : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
