// Generate browser-tab and device icons from the brand mark.
// Tab icons (icon.svg, favicon.ico) use the bolder tab-size mark (careerproof-global-icon-small.svg) so they stay
// crisp at 16 and 32 px; home-screen and manifest icons use the detailed mark (careerproof-global-icon.svg).
// Outputs (Next.js picks up app/ files automatically):
//   apps/web/src/app/icon.svg        modern browsers (scalable)
//   apps/web/src/app/favicon.ico     16, 32 and 48 px PNGs in one ICO (tabs, older browsers)
//   apps/web/src/app/apple-icon.png  180 px (iOS home screen)
//   apps/web/public/icon-192.png, icon-512.png (web app manifest)
// Usage: node scripts/brand-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const WEB = join(ROOT, "apps", "web");
const svg = readFileSync(join(WEB, "public", "brand", "careerproof-global-icon.svg"));
const small = readFileSync(join(WEB, "public", "brand", "careerproof-global-icon-small.svg"));
const png = (size, src = svg) => sharp(src, { density: Math.max(72, (size / 120) * 72 * 4) }).resize(size, size).png().toBuffer();

writeFileSync(join(WEB, "src", "app", "icon.svg"), small);
writeFileSync(join(WEB, "src", "app", "apple-icon.png"), await png(180));
writeFileSync(join(WEB, "public", "icon-192.png"), await png(192));
writeFileSync(join(WEB, "public", "icon-512.png"), await png(512));

// ICO container holding PNG images (supported by all current browsers).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(s, small)));
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
console.log("Icons written: icon.svg, favicon.ico (16/32/48), apple-icon.png (180), icon-192.png, icon-512.png");
