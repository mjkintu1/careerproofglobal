// Generate browser-tab and device icons from the brand mark.
// Tab icons use the official mark redrawn on pixel grids (careerproof-global-icon-16.svg, -32.svg): same design,
// with edges on whole pixels so it is sharp at tab size. Home-screen and manifest icons use the official mark
// (careerproof-global-icon.svg).
// Outputs (Next.js picks up app/ files automatically):
//   apps/web/src/app/favicon.ico     16, 32 and 48 px PNGs in one ICO; browsers pick the frame for the screen
//   (No icon.svg on purpose: browsers prefer an SVG and scale it themselves, which blurs it at 16 px.)
//   apps/web/src/app/apple-icon.png  180 px (iOS home screen)
//   apps/web/public/icon-192.png, icon-512.png (web app manifest)
// Usage: node scripts/brand-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const WEB = join(ROOT, "apps", "web");
const svg = readFileSync(join(WEB, "public", "brand", "careerproof-global-icon.svg"));
const g16 = readFileSync(join(WEB, "public", "brand", "careerproof-global-icon-16.svg"));
const g32 = readFileSync(join(WEB, "public", "brand", "careerproof-global-icon-32.svg"));
const png = (size, src = svg) => sharp(src, { density: Math.max(72, (size / 120) * 72 * 4) }).resize(size, size).png().toBuffer();
/** Render a pixel-grid master at exactly its own size (no resampling), so edges stay on whole pixels. */
const exact = (src, size) => sharp(src, { density: 72 }).resize(size, size).png().toBuffer();

writeFileSync(join(WEB, "src", "app", "apple-icon.png"), await png(180));
writeFileSync(join(WEB, "public", "icon-192.png"), await png(192));
writeFileSync(join(WEB, "public", "icon-512.png"), await png(512));

// ICO container holding PNG images (supported by all current browsers).
const sizes = [16, 32, 48];
const images = await Promise.all([exact(g16, 16), exact(g32, 32), png(48)]);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
const dir = Buffer.alloc(16 * sizes.length);
let offset = 6 + dir.length;
sizes.forEach((s, i) => {
  const o = i * 16;
  dir.writeUInt8(s, o); dir.writeUInt8(s, o + 1); dir.writeUInt8(0, o + 2); dir.writeUInt8(0, o + 3);
  dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
  dir.writeUInt32LE(images[i].length, o + 8); dir.writeUInt32LE(offset, o + 12);
  offset += images[i].length;
});
writeFileSync(join(WEB, "src", "app", "favicon.ico"), Buffer.concat([header, dir, ...images]));
console.log("Icons written: favicon.ico (16/32/48), apple-icon.png (180), icon-192.png, icon-512.png");
