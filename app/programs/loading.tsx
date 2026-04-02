export default function ProgramsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-16 w-full animate-pulse rounded-xl bg-gray-100" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }, (_, idx) => (
          <div key={`program-loading-${idx}`} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="h-56 w-full animate-pulse bg-gray-200" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-5/6 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
