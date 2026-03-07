export default function Loading() {
  return (
    <div className="container-custom py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-28 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
