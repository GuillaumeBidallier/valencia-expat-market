export default function ListingDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        {[80, 60, 90, 140].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 bg-gray-100 rounded" style={{ width: w }} />
            {i < 3 && <div className="w-3 h-3 bg-gray-100 rounded" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-3">
          <div className="aspect-[16/10] rounded-xl bg-gray-100" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-lg bg-gray-100" />
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <div className="h-5 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="flex gap-4">
              <div className="h-4 bg-gray-100 rounded w-32" />
              <div className="h-4 bg-gray-100 rounded w-28" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-24 mt-2" />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="h-5 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-11 bg-gray-100 rounded-xl" />
            <div className="h-11 bg-gray-100 rounded-xl" />
            <div className="h-11 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
