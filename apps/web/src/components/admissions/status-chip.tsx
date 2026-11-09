import type { AdmissionStatus } from "@careerproof/reference-data";

const STYLE: Record<AdmissionStatus, { text: string; cls: string }> = {
  verified: { text: "Checked with the official source", cls: "bg-teal-50 text-teal-800" },
  illustrative: { text: "Illustrative: not yet verified", cls: "bg-gold-50 text-gold-800" },
  pending: { text: "Being confirmed", cls: "bg-surface-muted text-ink-muted" },
};

export function StatusChip({ status }: { status: AdmissionStatus }) {
  const s = STYLE[status];
  return <span className={`chip px-2 py-0.5 text-xs ${s.cls}`}>{s.text}</span>;
}
