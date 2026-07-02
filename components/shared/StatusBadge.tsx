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
      },
    },
    defaultVariants: {
      status: "not_started",
    },
  }
);

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "not_started" | "in_progress" | "review" | "approved" | "revision_requested" | string | null;
  label?: string;
}

export function StatusBadge({ className, status, label, ...props }: StatusBadgeProps) {
  // Replace ALL underscores with spaces
  const displayLabel = label || status?.replace(/_/g, " ").toUpperCase();
  const variantStatus = status as VariantProps<typeof badgeVariants>["status"];
  return (
    <div className={cn(badgeVariants({ status: variantStatus }), className)} {...props}>
      {displayLabel}
    </div>
  );
}
