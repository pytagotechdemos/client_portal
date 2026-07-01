"use client";

import { useState } from "react";
import { createInvoice } from "@/app/actions/invoice";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Deliverable = {
  id: string;
  name: string;
};

export default function InvoiceForm({ projectId, deliverables }: { projectId: string, deliverables: Deliverable[] }) {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, number>>(
    deliverables.reduce((acc, d) => ({ ...acc, [d.id]: 1000 }), {}) // default $1000
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = Object.values(prices).reduce((a, b) => a + b, 0);

  const handlePriceChange = (id: string, value: string) => {
    const num = parseFloat(value);
    setPrices(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const items = deliverables.map(d => ({
      deliverableId: d.id,
      description: d.name,
      amount: prices[d.id]
    }));
    
    formData.append("items", JSON.stringify(items));
    formData.append("totalAmount", totalAmount.toString());
    
    try {
      await createInvoice(formData);
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate invoice");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="projectId" value={projectId} />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Billable Deliverables</h3>
        <p className="text-sm text-muted">Only APPROVED deliverables can be invoiced.</p>
        
        {deliverables.length === 0 ? (
          <div className="p-4 bg-background border border-border rounded text-muted">
            No approved deliverables available to invoice.
          </div>
        ) : (
          <div className="bg-background border border-border rounded-md overflow-hidden">
            {deliverables.map(d => (
              <div key={d.id} className="flex justify-between items-center p-4 border-b border-border last:border-0">
                <span className="text-white">{d.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted">$</span>
                  <input 
                    type="number" 
                    value={prices[d.id] || ""}
                    onChange={(e) => handlePriceChange(d.id, e.target.value)}
                    className="w-24 bg-surface border border-border rounded px-2 py-1 text-white text-right focus:outline-none focus:border-[#8B5CF6]" 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Additional Notes</label>
        <textarea 
          name="notes" 
          rows={3}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" 
          placeholder="Payment terms, bank details, etc."
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="text-xl text-white">
          Total: <span className="font-bold text-[#10B981]">${totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/projects/${projectId}`}
            className="px-4 py-2 text-white bg-surface-hover hover:bg-muted border border-border rounded-md transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={deliverables.length === 0 || isSubmitting}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Generating..." : "Generate Invoice"}
          </button>
        </div>
      </div>
    </form>
  );
}
