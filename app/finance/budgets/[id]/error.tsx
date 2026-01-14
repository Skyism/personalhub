'use client'

import Link from 'next/link'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BudgetDetailError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg shadow p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">
              Failed to load budget details
            </h1>
            <p className="text-red-700 mb-6">
              Something went wrong while loading this budget. Please try again.
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
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/finance/budgets"
                className="bg-white text-red-600 border border-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
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
