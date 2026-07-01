import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-surface border border-border rounded-lg p-10 text-center max-w-md w-full">
        <h1 className="text-6xl font-bold text-[#8B5CF6] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-muted text-sm mb-8">
          We couldn&apos;t find the page you were looking for. It might have been moved or doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
