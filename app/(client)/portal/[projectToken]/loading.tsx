export default function ClientPortalLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-10 w-1/3 bg-surface rounded mb-4"></div>
        <div className="h-6 w-2/3 bg-surface rounded"></div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="h-10 w-32 bg-surface rounded"></div>
        <div className="h-10 w-32 bg-surface rounded"></div>
        <div className="h-10 w-32 bg-surface rounded"></div>
      </div>

      <div className="grid gap-6">
        <div className="h-32 w-full bg-surface rounded-xl"></div>
        <div className="h-32 w-full bg-surface rounded-xl"></div>
        <div className="h-32 w-full bg-surface rounded-xl"></div>
      </div>
    </div>
  );
}
