export default function Loading() {
  return (
    <div className="container-custom py-6">
      <div className="mb-8 space-y-2">
        <div className="h-9 w-56 skeleton rounded" />
        <div className="h-4 w-24 skeleton rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
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
  );
}
