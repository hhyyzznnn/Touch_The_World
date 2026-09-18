export default function SchoolLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="h-[100px] w-[100px] animate-pulse rounded-full bg-gray-200" />
        <div className="h-9 w-52 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
      </div>

      <div className="space-y-12">
        <div>
          <div className="mb-6 h-7 w-20 animate-pulse rounded bg-gray-200" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, idx) => (
              <div key={`school-event-loading-${idx}`} className="overflow-hidden rounded-lg border bg-white">
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
      </div>
    </div>
  );
}
