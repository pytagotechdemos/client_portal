export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-surface border border-border rounded-md animate-pulse"></div>
      
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-hover/30 flex gap-4">
          <div className="h-6 w-24 bg-muted/20 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-muted/20 rounded animate-pulse"></div>
          <div className="h-6 w-16 bg-muted/20 rounded animate-pulse"></div>
        </div>
        
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-b-0 flex gap-4 items-center">
            <div className="h-6 w-1/4 bg-muted/20 rounded animate-pulse"></div>
            <div className="h-6 w-1/4 bg-muted/20 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-muted/20 rounded animate-pulse ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
