"use client";

import { useRef, useEffect } from "react";
import { addComment, deleteComment } from "@/app/actions/comment";
import { formatDistanceToNow } from "date-fns";
import { SubmitButton } from "./SubmitButton";
import { Trash2 } from "lucide-react";
import useSWR from "swr";
import { toast } from "sonner";

type CommentType = {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: Date;
  deliverableId: string | null;
};

interface CommentSectionProps {
  projectId: string;
  comments: CommentType[]; // Used as initial fallback data
  currentUser: {
    name: string;
    role: "ADMIN" | "CLIENT";
  };
  deliverableId?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function CommentSection({ projectId, comments: initialComments, currentUser, deliverableId }: CommentSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  const apiUrl = deliverableId 
    ? `/api/comments?projectId=${projectId}&deliverableId=${deliverableId}`
    : `/api/comments?projectId=${projectId}`;
    
  const { data: comments, mutate } = useSWR<CommentType[]>(apiUrl, fetcher, {
    fallbackData: initialComments,
    refreshInterval: 5000, // Poll every 5 seconds
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when comments change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleAction = async (formData: FormData) => {
    // Optimistic update could go here, but for now we just mutate after server action
    try {
      await addComment(formData);
      formRef.current?.reset();
      mutate(); // trigger immediate re-fetch
      toast.success("Komentar berhasil dikirim");
    } catch {
      toast.error("Gagal mengirim komentar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id, projectId);
      mutate();
      toast.success("Komentar berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus komentar");
    }
  };

  const displayComments = comments || initialComments;

  return (
    <div className="flex flex-col gap-6">
      <div ref={scrollRef} className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {displayComments.length === 0 ? (
          <p className="text-sm text-center py-4 text-muted">Belum ada komentar. Mulai percakapan!</p>
        ) : (
          displayComments.map((comment) => (
            <div 
              key={comment.id} 
              className={`flex flex-col ${comment.authorRole === currentUser.role ? "items-end" : "items-start"}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  comment.authorRole === currentUser.role 
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-surface border border-border text-foreground rounded-tl-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-1">
                  <span className="font-semibold text-sm">
                    {comment.authorName} {comment.authorRole === "ADMIN" && "🛡️"}
                  </span>
                  {comment.authorRole === currentUser.role && (
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-white/50 hover:text-red-400 transition-colors"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
              <span className="text-xs mt-1 px-1 text-muted">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>

      <form ref={formRef} action={handleAction} className="mt-2 flex gap-3 relative">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="authorName" value={currentUser.name} />
        <input type="hidden" name="authorRole" value={currentUser.role} />
        {deliverableId && <input type="hidden" name="deliverableId" value={deliverableId} />}
        
        <textarea
          data-testid="comment-input"
          name="content"
          placeholder="Ketik pesan..."
          required
          rows={1}
          className="flex-1 rounded-xl px-4 py-3 transition-colors resize-none overflow-hidden focus:outline-none focus:ring-1 bg-surface border border-border text-foreground focus:border-primary focus:ring-primary"
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = target.scrollHeight + "px";
          }}
        />
        <SubmitButton data-testid="comment-submit" className="self-end px-5 py-3 rounded-xl shadow-lg shadow-primary/20">
          Kirim
        </SubmitButton>
      </form>
    </div>
  );
}
