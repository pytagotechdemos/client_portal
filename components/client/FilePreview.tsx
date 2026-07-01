"use client";

export function FilePreview({ fileUrl, linkUrl, title = "Deliverable" }: { fileUrl?: string | null; linkUrl?: string | null, title?: string }) {
  if (linkUrl) {
    if (linkUrl.includes("figma.com")) {
      return <iframe title={`${title} Figma Preview`} className="w-full h-[600px] border border-border rounded-lg" src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(linkUrl)}`} allowFullScreen />;
    }
    if (linkUrl.includes("youtube.com") || linkUrl.includes("youtu.be")) {
      const videoId = linkUrl.split("v=")[1]?.split("&")[0] || linkUrl.split("/").pop();
      return (
        <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden border border-border">
          <iframe title={`${title} YouTube Video`} className="absolute top-0 left-0 w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} allowFullScreen />
        </div>
      );
    }
    if (linkUrl.includes("docs.google.com")) {
      const embedUrl = linkUrl.replace(/\/edit[^\/]*$/, "/preview");
      return <iframe title={`${title} Google Docs Preview`} className="w-full h-[600px] border border-border rounded-lg" src={embedUrl} />;
    }
    return (
      <div className="p-8 bg-surface border border-border rounded-lg text-center">
        <a href={linkUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-lg font-medium">
          Open External Link &rarr;
        </a>
      </div>
    );
  }

  if (fileUrl) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      return <iframe title={`${title} PDF Document`} className="w-full h-[600px] border border-border rounded-lg" src={fileUrl} />;
    }
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={fileUrl} alt={`${title} Preview`} className="w-full max-w-2xl mx-auto rounded-lg border border-border shadow-sm" />;
    }
    
    return (
      <div className="p-8 bg-surface border border-border rounded-lg text-center">
        <p className="text-muted mb-4">No preview available for this file type.</p>
        <a href={fileUrl} download className="bg-background border border-border text-foreground px-4 py-2 rounded-md font-medium hover:bg-surface">
          Download File
        </a>
      </div>
    );
  }

  return (
    <div className="p-8 bg-surface border border-border rounded-lg text-center text-muted">
      No file or link provided for this version.
    </div>
  );
}
