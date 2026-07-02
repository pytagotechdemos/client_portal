"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import { Download } from "lucide-react";
import { Project, AgencyClient, Invoice } from "@prisma/client";

interface ProjectWithClient extends Project {
  client: AgencyClient;
}

export function PDFExportButton({ invoice, project }: { invoice: Invoice, project: ProjectWithClient }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button disabled className="flex items-center gap-2 bg-surface border border-border hover:bg-surface-hover text-white h-10 px-4 text-sm font-medium rounded-md transition-colors shadow-sm opacity-70">
        <Download className="w-4 h-4" />
        Preparing PDF...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} project={project} />}
      fileName={`INV-${invoice.id.substring(invoice.id.length - 6).toUpperCase()}.pdf`}
      className="flex items-center gap-2 bg-surface border border-border hover:bg-surface-hover text-white h-10 px-4 text-sm font-medium rounded-md transition-colors shadow-sm"
    >
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
