"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import { Download } from "lucide-react";
import { Project, Client, Invoice } from "@prisma/client";

interface ProjectWithClient extends Project {
  client: Client;
}

export function PDFExportButton({ invoice, project }: { invoice: Invoice, project: ProjectWithClient }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button disabled className="flex items-center gap-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-foreground px-4 py-2 rounded-md transition-colors text-sm font-medium shadow-sm opacity-70">
        <Download className="w-4 h-4" />
        Preparing PDF...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} project={project} />}
      fileName={`INV-${invoice.id.substring(invoice.id.length - 6).toUpperCase()}.pdf`}
      className="flex items-center gap-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-foreground px-4 py-2 rounded-md transition-colors text-sm font-medium shadow-sm"
    >
      {/* @ts-expect-error Types from react-pdf are mismatching slightly */}
      {({ loading }) =>
        loading ? (
          <>
            <Download className="w-4 h-4" />
            Preparing PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export PDF
          </>
        )
      }
    </PDFDownloadLink>
  );
}
