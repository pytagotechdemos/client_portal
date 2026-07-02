"use client";

import { useFormStatus } from "react-dom";

export function ReviewSubmitButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="space-y-4 mt-4">
      <button 
        data-testid="approve-deliverable-button"
        type="submit" 
        name="action" 
        value="APPROVED" 
        disabled={pending}
        className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 rounded-lg font-bold shadow transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        {pending ? "Memproses..." : "Setujui Hasil Pekerjaan"}
      </button>

      <button 
        type="submit" 
        name="action" 
        value="APPROVED_WITH_TWEAKS" 
        disabled={pending}
        className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-2 rounded-lg font-bold shadow transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {pending ? "Memproses..." : "Setujui (dengan revisi kecil)"}
      </button>
      
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]"></div></div>
        <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-[#64748B]">ATAU</span></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Umpan Balik atau Catatan Revisi</label>
        <textarea 
          name="feedback" 
          rows={4} 
          disabled={pending}
          placeholder="Sebutkan detail yang perlu diubah..."
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] disabled:opacity-70 disabled:cursor-not-allowed"
        ></textarea>
      </div>
      
      <button 
        type="submit" 
        name="action" 
        value="REVISION_REQUESTED" 
        disabled={pending}
        className="w-full bg-white border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {pending ? "Memproses..." : "Ajukan Revisi"}
      </button>
    </div>
  );
}
