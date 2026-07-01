export default function ProjectLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-32 bg-surface rounded"></div>
        <div className="h-10 w-64 bg-surface rounded"></div>
        <div className="flex gap-4">
          <div className="h-4 w-48 bg-surface rounded"></div>
          <div className="h-4 w-48 bg-surface rounded"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b border-border pb-2">
        <div className="h-10 w-24 bg-surface rounded"></div>
        <div className="h-10 w-24 bg-surface rounded"></div>
        <div className="h-10 w-24 bg-surface rounded"></div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <div className="h-24 w-full bg-surface rounded-lg"></div>
        <div className="h-24 w-full bg-surface rounded-lg"></div>
        <div className="h-24 w-full bg-surface rounded-lg"></div>
      </div>
    </div>
  );
}
