export default function EventDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6 h-5 w-28 animate-pulse rounded bg-gray-100" />

      <div className="mb-8 space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-9 w-56 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
      </div>

      <div className="mb-8">
        <div className="mb-4 h-7 w-24 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, idx) => (
            <div key={`event-photo-loading-${idx}`} className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-lg border bg-gray-50 p-6">
        <div className="mb-4 h-6 w-28 animate-pulse rounded bg-gray-200" />
        <div className="mb-4 h-48 w-full animate-pulse rounded-lg bg-gray-200" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
