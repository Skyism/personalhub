export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto mt-8">
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-300 rounded animate-pulse" />
        </div>

        {/* Header with budget selector */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-9 w-32 bg-gray-300 rounded animate-pulse" />
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Grid layout for chart skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Spending chart skeleton */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-7 w-48 bg-gray-300 rounded animate-pulse mb-4" />
            <div className="h-[400px] bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Budget vs Actual chart skeleton */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-7 w-48 bg-gray-300 rounded animate-pulse mb-4" />
            <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Spending Trends chart skeleton - full width */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="h-7 w-48 bg-gray-300 rounded animate-pulse mb-4" />
            <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
