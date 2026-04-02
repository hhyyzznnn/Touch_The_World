export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6 h-8 w-36 animate-pulse rounded bg-gray-200" />
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="h-12 w-full animate-pulse border-b bg-gray-100" />
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 8 }, (_, idx) => (
              <div key={`news-loading-${idx}`} className="flex items-center gap-4 px-4 py-3">
                <div className="h-6 w-14 animate-pulse rounded bg-gray-100" />
                <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
