export default function EventsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-72 animate-pulse rounded bg-gray-100" />
      </div>

      <div className="mb-6 h-24 animate-pulse rounded-lg bg-gray-100" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }, (_, idx) => (
          <div key={`event-loading-${idx}`} className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white">
            <div className="h-48 w-full animate-pulse bg-gray-200" />
            <div className="space-y-3 p-6">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
