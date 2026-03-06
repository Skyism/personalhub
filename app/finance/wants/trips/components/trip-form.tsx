'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createTrip, updateTrip } from '../actions';

interface TripFormProps {
  wantsBudgetId: number;
  existingTrip?: {
    id: number;
    name: string;
    destination: string | null;
    start_date: string;
    end_date: string;
    budget_amount: number;
  };
}

export function TripForm({ wantsBudgetId, existingTrip }: TripFormProps) {
  const router = useRouter();
  const isEditMode = !!existingTrip;

  const [name, setName] = useState(existingTrip?.name ?? '');
  const [destination, setDestination] = useState(existingTrip?.destination ?? '');
  const [startDate, setStartDate] = useState(existingTrip?.start_date ?? '');
  const [endDate, setEndDate] = useState(existingTrip?.end_date ?? '');
  const [budgetAmount, setBudgetAmount] = useState(
    existingTrip?.budget_amount?.toString() ?? ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Budget amount must be greater than 0');
      return;
    }

    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }

    if (endDate < startDate) {
      setError('End date must be on or after start date');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await updateTrip(
          existingTrip.id,
          name.trim(),
          destination.trim() || null,
          startDate,
          endDate,
          amount
        );
        router.push(`/finance/wants/trips/${existingTrip.id}`);
      } else {
        await createTrip(
          name.trim(),
          destination.trim() || null,
          startDate,
          endDate,
          amount,
          wantsBudgetId
        );
        router.push('/finance/wants/trips');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Trip' : 'New Trip'}</CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Update your trip details and budget'
            : 'Plan a trip with a dedicated budget'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Trip Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Japan 2026"
              className="h-11"
              required
              autoComplete="off"
              autoFocus
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Tokyo, Kyoto"
              className="h-11"
              autoComplete="off"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date *</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11"
                required
              />
            </div>
          </div>

          {/* Budget Amount */}
          <div className="space-y-2">
            <Label htmlFor="budget">Trip Budget *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="budget"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7 font-mono h-11"
                required
                autoComplete="off"
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full h-11">
            {isSubmitting
              ? 'Saving...'
              : isEditMode
              ? 'Update Trip'
              : 'Create Trip'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
