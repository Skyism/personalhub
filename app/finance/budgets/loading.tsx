export default function BudgetsLoading() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-9 w-32 bg-muted/50 rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted/50 rounded animate-pulse mt-1" />
          </div>
          <div className="h-10 w-32 bg-muted/50 rounded-lg animate-pulse" />
        </div>

        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="block bg-card rounded-lg shadow p-6 border border-border"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="h-7 w-40 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted/50 rounded animate-pulse mt-1" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted/50 rounded animate-pulse mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
