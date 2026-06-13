export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] animate-pulse">
      <div className="bg-navy h-48" />
      <div className="bg-white border-b border-gray-100 h-12" />
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid sm:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-200/60 mb-12">
          <div className="h-56 sm:h-72 bg-gray-200" />
          <div className="bg-white p-8 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200/60">
              <div className="h-44 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
