import { ImageResponse } from "next/og";

export const alt = "CareerProof Global: map your path, prove your future";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social preview image for every page. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0b1f33", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800 }}>
          <span>Career</span>
          <span style={{ color: "#fdc500" }}>Proof</span>
          <span style={{ marginLeft: 20 }}>Global</span>
        </div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#00b4d8" }}>Map your path. Prove your future.</div>
        <div style={{ fontSize: 30, marginTop: 40, color: "#cbd5e1", maxWidth: 950 }}>
          Career paths for every country, built on ILO ISCO-08 and official data.
        </div>
      </div>
    ),
    size,
  );
}
