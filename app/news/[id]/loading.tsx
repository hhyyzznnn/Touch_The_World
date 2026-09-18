export default function NewsDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6 h-4 w-40 animate-pulse rounded bg-gray-200" />

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
          <div className="mb-4 flex gap-3">
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
          </div>
          <div className="mb-6 h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto aspect-[3/4] w-full max-w-md animate-pulse rounded-xl bg-gray-100 sm:max-w-lg" />
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
