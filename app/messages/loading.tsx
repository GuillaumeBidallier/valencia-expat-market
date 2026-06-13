export default function MessagesLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
      <div className="h-7 w-32 bg-gray-200 rounded mb-6" />

      <div className="flex gap-4 h-[calc(100vh-180px)] min-h-[500px]">
        {/* Conversation list */}
        <aside className="w-full sm:w-72 shrink-0 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="h-9 bg-gray-100 rounded-lg" />
          </div>
          <div className="flex-1 overflow-hidden divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Message thread */}
        <div className="hidden sm:flex flex-1 flex-col border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-hidden">
            {[false, true, false, false, true].map((isOwn, i) => (
              <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`h-10 rounded-2xl ${isOwn ? 'bg-orange-100' : 'bg-gray-100'}`}
                  style={{ width: `${[55, 40, 70, 45, 35][i]}%` }}
                />
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
