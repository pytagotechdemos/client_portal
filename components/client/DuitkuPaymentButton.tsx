"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

export function DuitkuPaymentButton({ invoiceId, projectId }: { invoiceId: string, projectId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/duitku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, projectId }),
      });

      const data = await res.json();
      if (data.paymentUrl) {
        toast.success("Mengalihkan ke halaman pembayaran...");
        window.location.href = data.paymentUrl;
      } else {
        toast.error("Gagal membuat transaksi: " + (data.error || "Unknown error"));
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat memproses pembayaran");
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="bg-[#10B981] hover:bg-[#059669] text-white h-10 px-4 text-sm font-medium rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
    >
      <CreditCard className="w-4 h-4" />
      {isLoading ? "Memproses..." : "Bayar dengan Duitku"}
    </button>
  );
}
