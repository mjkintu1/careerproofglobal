/** Horizontal logo without slogan, for the header (see docs/BRAND.md). Text uses the site display font. */
export function BrandLogo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const word = dark ? "#FFFFFF" : "#0B4AB0";
  const gid = dark ? "hdr-proof-dark" : "hdr-proof";
  const tid = dark ? "hdr-tile-dark" : "hdr-tile";
  return (
    <svg viewBox="0 0 520 120" role="img" aria-label="CareerProof Global" className={className}>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="347" y1="0" x2="512" y2="0">
          <stop offset="0" stopColor="#00B4D8" />
          <stop offset="0.25" stopColor="#00C8BA" />
          <stop offset="0.5" stopColor="#5DD389" />
          <stop offset="0.75" stopColor="#B4D24A" />
          <stop offset="1" stopColor="#FDC500" />
        </linearGradient>
        <linearGradient id={tid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1257D1" />
          <stop offset="1" stopColor="#0A3D8F" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill={`url(#${tid})`} />
      <polyline points="30,62 52,84 90,40" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="62" r="9" fill="#00B4D8" stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="52" cy="84" r="9" fill="#00B4D8" stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="90" cy="40" r="12" fill="#FDC500" stroke="#FFFFFF" strokeWidth="3" />
      <g style={{ fontFamily: "var(--font-display)" }}>
        <text x="144" y="70" fontSize="60" fontWeight="800" fill={word} textLength="200" lengthAdjust="spacingAndGlyphs">Career</text>
        <text x="347" y="70" fontSize="60" fontWeight="800" fill={`url(#${gid})`} textLength="165" lengthAdjust="spacingAndGlyphs">Proof</text>
        <text x="147" y="104" fontSize="22" fontWeight="700" fill={word} textLength="140" lengthAdjust="spacing">GLOBAL</text>
      </g>
    </svg>
  );
}
