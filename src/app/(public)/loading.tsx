export default function Loading() {
  return (
    <div className="container-custom py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Hero carousel skeleton */}
      <div>
        <div className="h-7 w-40 skeleton rounded mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[75vw] sm:w-[320px] md:w-[340px] rounded-xl overflow-hidden bg-surface-card border border-surface-border"
            >
              <div className="h-[260px] sm:h-[320px] md:h-[380px] lg:h-[400px] skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* Trending skeleton */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-4 sm:p-6">
        <div className="h-6 w-48 skeleton rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-16 h-12 skeleton rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-16 skeleton rounded" />
                <div className="h-4 w-full skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog grid skeleton */}
      <div>
        <div className="h-7 w-44 skeleton rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-surface-card rounded-xl border border-surface-border overflow-hidden"
            >
              <div className="aspect-video skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-20 skeleton rounded" />
                <div className="h-5 w-full skeleton rounded" />
                <div className="h-4 w-3/4 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        <div className="lg:col-span-2" />
        <div className="space-y-6">
          <div className="bg-surface-card rounded-xl border border-surface-border p-4 h-40 animate-pulse" />
          <div className="bg-surface-card rounded-xl border border-surface-border p-4 h-64 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
