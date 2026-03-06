'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar } from 'lucide-react';
import { TripForm } from './trip-form';
import { TripTransactionList } from './trip-transaction-list';
import { TripTransactionForm } from './trip-transaction-form';
import { TripDeleteDialog } from './trip-delete-dialog';
import { activateTrip, completeTrip } from '../actions';

interface TripTransaction {
  id: number;
  amount: number;
  note: string | null;
  transaction_date: string;
  source: string;
  created_at: string;
}

interface TripOverviewProps {
  trip: {
    id: number;
    name: string;
    destination: string | null;
    start_date: string;
    end_date: string;
    budget_amount: number;
    status: string;
    wants_budget_id: number;
  };
  totalSpent: number;
  transactions: TripTransaction[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  const startStr = startDate.toLocaleDateString('en-US', opts);
  const endStr = endDate.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-600/20 text-green-600 dark:text-green-400';
    case 'planned':
      return 'bg-blue-600/20 text-blue-600 dark:text-blue-400';
    case 'completed':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function TripOverview({ trip, totalSpent, transactions }: TripOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TripTransaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TripTransaction | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const budgetAmount = Number(trip.budget_amount);
  const remaining = budgetAmount - totalSpent;
  const progressPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

  let statusColor = 'text-green-600 dark:text-green-400';
  let progressBarColor = 'bg-green-600';

  if (progressPercentage >= 100) {
    statusColor = 'text-red-600 dark:text-red-400';
    progressBarColor = 'bg-red-600';
  } else if (progressPercentage >= 80) {
    statusColor = 'text-yellow-600 dark:text-yellow-400';
    progressBarColor = 'bg-yellow-600';
  }

  const handleStatusChange = async (action: 'activate' | 'complete') => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      if (action === 'activate') {
        await activateTrip(trip.id);
      } else {
        await completeTrip(trip.id);
      }
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <TripForm
          wantsBudgetId={trip.wants_budget_id}
          existingTrip={{
            id: trip.id,
            name: trip.name,
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date,
            budget_amount: budgetAmount,
          }}
        />
        <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{trip.name}</CardTitle>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadge(trip.status)}`}>
                  {trip.status}
                </span>
              </div>
              {trip.destination && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {trip.destination}
                </p>
              )}
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {formatDateRange(trip.start_date, trip.end_date)}
              </p>
            </div>
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
            <p className="text-sm text-muted-foreground mb-1">Trip Budget</p>
            <p className="text-4xl font-mono font-bold">
              {formatCurrency(budgetAmount)}
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
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-mono font-semibold ${remaining >= 0 ? 'text-foreground' : statusColor}`}>
                {formatCurrency(Math.abs(remaining))}
                {remaining < 0 && ' over'}
              </p>
            </div>
          </div>

          {/* Status Actions */}
          {statusError && (
            <p className="text-sm text-destructive">{statusError}</p>
          )}
          {trip.status === 'planned' && (
            <Button
              onClick={() => handleStatusChange('activate')}
              disabled={statusLoading}
              className="w-full h-11"
              size="lg"
            >
              {statusLoading ? 'Activating...' : 'Activate Trip'}
            </Button>
          )}
          {trip.status === 'active' && (
            <Button
              onClick={() => handleStatusChange('complete')}
              disabled={statusLoading}
              variant="outline"
              className="w-full h-11"
              size="lg"
            >
              {statusLoading ? 'Completing...' : 'Complete Trip'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Button (only when active) */}
      {trip.status === 'active' && (
        <Button
          onClick={() => setIsAddingTransaction(true)}
          className="w-full h-11"
          size="lg"
        >
          Add Transaction
        </Button>
      )}

      {/* Transaction List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>
        <TripTransactionList
          transactions={transactions}
          onEdit={(t) => setEditingTransaction(t)}
          onDelete={(t) => setDeletingTransaction(t)}
          readOnly={trip.status === 'completed'}
        />
      </div>

      {/* Transaction Form Dialog */}
      {(isAddingTransaction || editingTransaction) && (
        <TripTransactionForm
          tripId={trip.id}
          wantsBudgetId={trip.wants_budget_id}
          transaction={editingTransaction}
          onClose={() => {
            setIsAddingTransaction(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTransaction && (
        <TripDeleteDialog
          transaction={deletingTransaction}
          tripId={trip.id}
          onClose={() => setDeletingTransaction(null)}
        />
      )}
    </div>
  );
}
