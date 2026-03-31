export default function Loading() {
  return (
    <div className="container-custom py-6 space-y-10">
      {/* Hero skeleton */}
      <div className="rounded-xl skeleton aspect-[21/9]" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {[1, 2].map((s) => (
            <div key={s} className="space-y-4">
              <div className="h-7 w-48 skeleton rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
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
          ))}
        </div>
        <div className="space-y-6">
          <div className="bg-surface-card rounded-xl border border-surface-border p-4 h-40 animate-pulse" />
          <div className="bg-surface-card rounded-xl border border-surface-border p-4 h-64 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
