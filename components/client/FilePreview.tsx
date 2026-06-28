"use client";

export function FilePreview({ fileUrl, linkUrl }: { fileUrl?: string | null; linkUrl?: string | null }) {
  if (linkUrl) {
    if (linkUrl.includes("figma.com")) {
      return <iframe className="w-full h-[600px] border border-[#E2E8F0] rounded-lg" src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(linkUrl)}`} allowFullScreen />;
    }
    if (linkUrl.includes("youtube.com") || linkUrl.includes("youtu.be")) {
      // Basic extraction for YouTube ID - for MVP
      const videoId = linkUrl.split("v=")[1]?.split("&")[0] || linkUrl.split("/").pop();
      return (
        <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden border border-[#E2E8F0]">
          <iframe className="absolute top-0 left-0 w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} allowFullScreen />
        </div>
      );
    }
    if (linkUrl.includes("docs.google.com")) {
      const embedUrl = linkUrl.replace(/\/edit[^\/]*$/, "/preview");
      return <iframe className="w-full h-[600px] border border-[#E2E8F0] rounded-lg" src={embedUrl} />;
    }
    return (
      <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center">
        <a href={linkUrl} target="_blank" rel="noreferrer" className="text-[#7C3AED] hover:underline text-lg font-medium">
          Open External Link &rarr;
        </a>
      </div>
    );
  }

  if (fileUrl) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      return <iframe className="w-full h-[600px] border border-[#E2E8F0] rounded-lg" src={fileUrl} />;
    }
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={fileUrl} alt="Preview" className="w-full max-w-2xl mx-auto rounded-lg border border-[#E2E8F0] shadow-sm" />;
    }
    
    return (
      <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center">
        <p className="text-[#64748B] mb-4">No preview available for this file type.</p>
        <a href={fileUrl} download className="bg-white border border-[#E2E8F0] text-[#0F172A] px-4 py-2 rounded-md font-medium hover:bg-[#F8FAFC]">
          Download File
        </a>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center text-[#64748B]">
      No file or link provided for this version.
    </div>
  );
}
