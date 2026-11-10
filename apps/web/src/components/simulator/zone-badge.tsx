import { CircleAlert, CircleCheck, CircleHelp, TriangleAlert } from "lucide-react";
import type { Zone } from "@careerproof/rules-engine";

const styles: Record<Zone, { label: string; className: string; Icon: typeof CircleCheck }> = {
  safe: { label: "Above recent cut-offs", className: "bg-zone-safe text-white", Icon: CircleCheck },
  borderline: { label: "Within recent cut-offs", className: "bg-gold-400 text-ink", Icon: TriangleAlert },
  danger: { label: "Below recent cut-offs", className: "bg-zone-danger text-white", Icon: CircleAlert },
  no_data: { label: "Not enough years published", className: "bg-surface-muted text-ink border border-border", Icon: CircleHelp },
};

/** Zone compares points with published cut-offs (never a chance of admission). Colour + icon + words. */
export function ZoneBadge({ zone }: { zone: Zone }) {
  const { label, className, Icon } = styles[zone];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-bold ${className}`}>
      <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
      {label}
    </span>
  );
}
