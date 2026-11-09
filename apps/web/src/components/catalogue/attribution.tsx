import { attributions } from "@careerproof/reference-data";

/** Licence-required attribution for ESCO / ISCO and O*NET content. */
export function CatalogueAttribution({ onet = true }: { onet?: boolean }) {
  return (
    <aside aria-label="Data sources" className="space-y-2 rounded-[var(--radius-card)] border border-line bg-white p-4 text-xs text-ink-muted">
      <p><span className="font-semibold text-ink">Sources.</span> {attributions.esco} <a href={attributions.escoUrl}>esco.ec.europa.eu</a></p>
      {onet && <p>{attributions.onet} <a href={attributions.onetUrl}>onetcenter.org</a></p>}
    </aside>
  );
}
