import Link from 'next/link'

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance</h1>
        <p className="text-gray-600 mb-8">Track your budget and expenses</p>

        <div className="space-y-4">
          <Link
            href="/finance/budgets"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Budgets</h2>
            <p className="text-gray-600">View and manage your monthly budgets</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
