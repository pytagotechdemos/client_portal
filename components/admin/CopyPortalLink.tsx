"use client";

export function CopyPortalLink({ portalPath }: { portalPath: string }) {
  const handleCopy = async () => {
    try {
      // Get the base URL from browser
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${portalPath}`;
      await navigator.clipboard.writeText(fullUrl);
      alert("Portal link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      data-testid="copy-portal-link"
      onClick={handleCopy}
      className="bg-surface border border-border hover:bg-surface-hover text-white px-4 h-10 rounded-md transition-colors text-sm font-medium flex items-center justify-center whitespace-nowrap"
    >
      Copy Portal Link
    </button>
  );
}
