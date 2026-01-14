export default function BudgetDetailLoading() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-300 rounded animate-pulse" />
        </div>

        {/* Header skeleton */}
        <div className="bg-card rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="h-9 w-48 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mt-1" />
            </div>
            <div className="text-right">
              <div className="h-9 w-32 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Category allocation skeleton */}
        <div className="bg-card rounded-lg shadow p-6 mb-6">
          <div className="h-7 w-48 bg-gray-300 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Spending summary skeleton */}
        <div className="bg-card rounded-lg shadow p-6 mt-6">
          <div className="h-7 w-48 bg-gray-300 rounded animate-pulse mb-6" />

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-300 rounded animate-pulse" />
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="h-full bg-gray-300 animate-pulse" style={{ width: '40%' }} />
            </div>
          </div>

          {/* Category breakdown skeleton */}
          <div>
            <div className="h-6 w-40 bg-gray-300 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="text-right">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gray-300 animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction list skeleton */}
        <div className="bg-card rounded-lg shadow p-6 mt-6">
          <div className="h-7 w-40 bg-gray-300 rounded animate-pulse mb-6" />

          <div className="space-y-6">
            {[1, 2].map((group) => (
              <div key={group}>
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse mb-3" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
