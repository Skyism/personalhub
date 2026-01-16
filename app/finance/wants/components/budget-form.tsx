'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createWantsBudget, updateWantsBudget } from '../actions';
import type { WantsPeriod } from '@/lib/wants/periods';

interface WantsBudgetFormProps {
  period: WantsPeriod;
  existingBudget?: {
    id: number;
    total_amount: number;
  };
}

export function WantsBudgetForm({ period, existingBudget }: WantsBudgetFormProps) {
  const [amount, setAmount] = useState(existingBudget?.total_amount.toString() ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const totalAmount = parseFloat(amount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      if (existingBudget) {
        await updateWantsBudget(existingBudget.id, totalAmount);
      } else {
        await createWantsBudget(period.periodStart, period.periodEnd, totalAmount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingBudget ? 'Update Budget' : 'Set Up Your Wants Budget'}</CardTitle>
        <CardDescription>
          {existingBudget
            ? `Modify your total budget for ${period.label}`
            : `Set your total wants budget for ${period.label} (6-month period)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium text-foreground">
              Total Budget for {period.label}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7 font-mono"
                required
                disabled={isSubmitting}
                aria-invalid={!!error}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11"
          >
            {isSubmitting
              ? 'Saving...'
              : existingBudget
              ? 'Update Budget'
              : 'Set Budget'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
