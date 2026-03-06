'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar } from 'lucide-react';

interface TripCardProps {
  trip: {
    id: number;
    name: string;
    destination: string | null;
    start_date: string;
    end_date: string;
    budget_amount: number;
    status: string;
  };
  totalSpent: number;
  index?: number;
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
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
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

export function TripCard({ trip, totalSpent, index = 0 }: TripCardProps) {
  const budgetAmount = Number(trip.budget_amount);
  const progressPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

  let progressBarColor = 'bg-green-600';
  if (progressPercentage >= 100) {
    progressBarColor = 'bg-red-600';
  } else if (progressPercentage >= 80) {
    progressBarColor = 'bg-yellow-600';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link href={`/finance/wants/trips/${trip.id}`}>
        <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
          <CardContent className="py-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">{trip.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadge(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>
                {trip.destination && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {trip.destination}
                  </p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateRange(trip.start_date, trip.end_date)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-mono font-semibold">
                  {formatCurrency(totalSpent)}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {formatCurrency(budgetAmount)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressBarColor} transition-all duration-500`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
