"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

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
        window.location.href = data.paymentUrl;
      } else {
        alert("Failed to initialize payment: " + (data.error || "Unknown error"));
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={isLoading}
      className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 font-medium"
    >
      <CreditCard className="w-4 h-4" />
      {isLoading ? "Processing..." : "Pay with Duitku"}
    </button>
  );
}
