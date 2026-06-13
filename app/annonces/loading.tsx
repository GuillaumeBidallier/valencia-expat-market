export default function AnnoncesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky search bar skeleton */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-3 lg:px-6 py-5">
        <div className="flex gap-4 items-start">
          {/* Sidebar filters skeleton */}
          <div className="hidden lg:block w-56 shrink-0 space-y-3">
            <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>

          {/* Listing rows skeleton */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="hidden lg:block h-5 w-40 bg-gray-100 rounded animate-pulse mb-1" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 animate-pulse">
                <div className="w-20 h-20 rounded-lg bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="w-16 h-8 bg-gray-100 rounded-lg shrink-0 self-center" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
