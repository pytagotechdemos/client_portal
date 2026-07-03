import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        not_started: "bg-surface-hover text-[#71717A] border-border",
        in_progress: "bg-[#083344] text-[#06B6D4] border-[#0E7490]",
        review: "bg-[#451A03] text-[#F59E0B] border-[#B45309]",
        approved: "bg-[#022C22] text-[#10B981] border-[#059669]",
        revision_requested: "bg-[#450A0A] text-[#EF4444] border-[#B91C1C]",
        // Project statuses
        active: "bg-[#083344] text-[#06B6D4] border-[#0E7490]",
        on_hold: "bg-[#451A03] text-[#F59E0B] border-[#B45309]",
        completed: "bg-[#022C22] text-[#10B981] border-[#059669]",
        cancelled: "bg-[#450A0A] text-[#EF4444] border-[#B91C1C]",
        // Invoice statuses
        draft: "bg-surface-hover text-[#71717A] border-border",
        sent: "bg-[#451A03] text-[#F59E0B] border-[#B45309]",
        paid: "bg-[#022C22] text-[#10B981] border-[#059669]",
        overdue: "bg-[#450A0A] text-[#EF4444] border-[#B91C1C]",
        // CR statuses
        pending: "bg-[#451A03] text-[#F59E0B] border-[#B45309]",
        accepted: "bg-[#022C22] text-[#10B981] border-[#059669]",
        rejected: "bg-[#450A0A] text-[#EF4444] border-[#B91C1C]",
        discussed: "bg-[#083344] text-[#06B6D4] border-[#0E7490]",
      },
    },
    defaultVariants: {
      status: "not_started",
    },
  }
);

// Map various status formats to standardized lowercase variant keys
function normalizeStatus(status: string | null | undefined): string {
  if (!status) return "not_started";

  // Convert to lowercase and replace spaces with underscores
  const normalized = status.toLowerCase().replace(/\s+/g, "_");

  // Map Prisma enum values to variant keys
  const statusMap: Record<string, string> = {
    // ProjectStatus
    "active": "active",
    "on_hold": "on_hold",
    "completed": "completed",
    "cancelled": "cancelled",
    // DeliverableStatus
    "not_started": "not_started",
    "in_progress": "in_progress",
    "review": "review",
    "approved": "approved",
    "revision_requested": "revision_requested",
    // InvoiceStatus
    "draft": "draft",
    "sent": "sent",
    "paid": "paid",
    "overdue": "overdue",
    // CRStatus
    "pending": "pending",
    "accepted": "accepted",
    "rejected": "rejected",
    "discussed": "discussed",
  };

  return statusMap[normalized] || "not_started";
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "not_started" | "in_progress" | "review" | "approved" | "revision_requested" | string | null;
  label?: string;
}

export function StatusBadge({ className, status, label, ...props }: StatusBadgeProps) {
  const displayLabel = label || status?.replace(/_/g, " ").toUpperCase();
  const variantStatus = normalizeStatus(status) as VariantProps<typeof badgeVariants>["status"];
  return (
    <div className={cn(badgeVariants({ status: variantStatus }), className)} {...props}>
      {displayLabel}
    </div>
  );
}
