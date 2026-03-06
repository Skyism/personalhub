'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TripTransaction {
  id: number;
  amount: number;
  note: string | null;
  transaction_date: string;
  source: string;
  created_at: string;
}

interface TripTransactionListProps {
  transactions: TripTransaction[];
  onEdit: (transaction: TripTransaction) => void;
  onDelete: (transaction: TripTransaction) => void;
  readOnly?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDateGroup(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return 'Earlier';
}

function groupTransactionsByDate(transactions: TripTransaction[]): Record<string, TripTransaction[]> {
  const groups: Record<string, TripTransaction[]> = {
    'Today': [],
    'Yesterday': [],
    'Earlier': [],
  };

  transactions.forEach((transaction) => {
    const group = getDateGroup(transaction.transaction_date);
    groups[group].push(transaction);
  });

  return groups;
}

export function TripTransactionList({ transactions, onEdit, onDelete, readOnly = false }: TripTransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No transactions yet. Add one or text &quot;trip amount note&quot;.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-6">
      {['Today', 'Yesterday', 'Earlier'].map((group) => {
        const groupTransactions = groupedTransactions[group];
        if (groupTransactions.length === 0) return null;

        return (
          <div key={group}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {group}
            </h3>
            <div className="space-y-2">
              {groupTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: 'easeOut',
                  }}
                >
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-mono font-semibold">
                              {formatCurrency(Number(transaction.amount))}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                transaction.source === 'sms'
                                  ? 'bg-accent/20 text-accent'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {transaction.source.toUpperCase()}
                            </span>
                          </div>
                          {transaction.note && (
                            <p className="text-sm text-muted-foreground truncate">
                              {transaction.note}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(transaction.transaction_date)}
                          </p>
                        </div>
                        {!readOnly && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 text-muted-foreground hover:text-foreground"
                              onClick={() => onEdit(transaction)}
                              aria-label="Edit transaction"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 text-muted-foreground hover:text-destructive"
                              onClick={() => onDelete(transaction)}
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
