export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative min-h-[500px] bg-gray-800 flex flex-col items-center justify-center px-4 animate-pulse">
        <div className="h-10 w-80 bg-white/20 rounded-xl mb-4" />
        <div className="h-6 w-64 bg-white/10 rounded-lg mb-8" />
        <div className="w-full max-w-2xl h-16 bg-white/20 rounded-2xl" />
      </div>

      {/* Categories skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="h-6 w-40 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Listing cards skeleton */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="h-6 w-48 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
