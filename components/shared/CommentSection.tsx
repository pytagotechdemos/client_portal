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
  theme?: "light" | "dark";
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function CommentSection({ projectId, comments: initialComments, currentUser, deliverableId, theme = "dark" }: CommentSectionProps) {
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
    } catch (e) {
      toast.error("Failed to post comment");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id, projectId);
      mutate();
      toast.success("Comment deleted");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  };

  const displayComments = comments || initialComments;

  return (
    <div className="flex flex-col gap-6">
      <div ref={scrollRef} className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {displayComments.length === 0 ? (
          <p className={`text-sm text-center py-4 ${theme === "dark" ? "text-muted" : "text-[#64748B]"}`}>No comments yet. Start the conversation!</p>
        ) : (
          displayComments.map((comment) => (
            <div 
              key={comment.id} 
              className={`flex flex-col ${comment.authorRole === currentUser.role ? "items-end" : "items-start"}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  comment.authorRole === currentUser.role 
                    ? theme === "dark" ? "bg-[#8B5CF6] text-white rounded-tr-sm" : "bg-[#7C3AED] text-white rounded-tr-sm"
                    : theme === "dark" ? "bg-[#1E293B] border border-[#334155] text-white rounded-tl-sm" : "bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] rounded-tl-sm"
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
              <span className={`text-xs mt-1 px-1 ${theme === "dark" ? "text-muted" : "text-[#64748B]"}`}>
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
          name="content"
          placeholder="Type a message..."
          required
          rows={1}
          className={`flex-1 rounded-xl px-4 py-3 transition-colors resize-none overflow-hidden focus:outline-none focus:ring-1 ${
            theme === "dark" 
              ? "bg-surface border border-border text-white focus:border-[#8B5CF6] focus:ring-[#8B5CF6]" 
              : "bg-white border border-[#E2E8F0] text-[#0F172A] focus:border-[#7C3AED] focus:ring-[#7C3AED]"
          }`}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = target.scrollHeight + "px";
          }}
        />
        <SubmitButton className="self-end px-5 py-3 rounded-xl shadow-lg shadow-primary/20">
          Send
        </SubmitButton>
      </form>
    </div>
  );
}
