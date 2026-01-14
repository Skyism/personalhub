'use client'

import Link from 'next/link'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AnalyticsError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg shadow p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">
              Failed to load analytics
            </h1>
            <p className="text-red-700 mb-6">
              Something went wrong while loading the analytics dashboard. Please try again.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-100 border border-red-300 rounded p-4 mb-6 text-left">
                <p className="text-sm font-mono text-red-800 break-all">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="bg-destructive text-white px-6 py-3 rounded-lg font-medium hover:bg-destructive/90 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/finance/budgets"
                className="bg-card text-destructive border border-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Back to Budgets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
