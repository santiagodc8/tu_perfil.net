export default function Loading() {
  return (
    <div className="container-custom py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-28 skeleton rounded-full" />
          <div className="h-4 w-32 skeleton rounded" />
        </div>
        <div className="h-10 w-full skeleton rounded" />
        <div className="h-8 w-3/4 skeleton rounded" />
        <div className="aspect-video skeleton rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 skeleton rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
