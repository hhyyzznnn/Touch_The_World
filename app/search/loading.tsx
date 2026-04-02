export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-44 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-56 animate-pulse rounded bg-gray-100" />
      </div>

      <div className="mb-8 space-y-4">
        <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200" />
        <div className="h-56 w-full animate-pulse rounded-lg bg-gray-100" />
      </div>

      <div className="space-y-12">
        {Array.from({ length: 2 }, (_, sectionIdx) => (
          <section key={`search-section-loading-${sectionIdx}`}>
            <div className="mb-6 h-8 w-44 animate-pulse rounded bg-gray-200" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, cardIdx) => (
                <div
                  key={`search-card-loading-${sectionIdx}-${cardIdx}`}
                  className="space-y-3 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="h-40 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
