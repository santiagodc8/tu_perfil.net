export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-48 bg-surface-border rounded animate-pulse mb-6" />
      <div className="space-y-4">
        <div className="h-14 w-full bg-surface-border rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-24 bg-surface-border rounded-xl animate-pulse" />
          <div className="h-24 bg-surface-border rounded-xl animate-pulse" />
        </div>
        <div className="h-64 bg-surface-border rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
