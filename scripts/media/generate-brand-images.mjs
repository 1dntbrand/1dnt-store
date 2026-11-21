// Builds the link preview and app icons into src/app (Next.js file conventions).
// Run: node scripts/media/generate-brand-images.mjs
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const app = join(process.cwd(), "src/app");
const INK = "#252622";
const PAPER = "#f7f4ed";
const MUTED = "#56594d";

/* Link preview: brand statement on the left, Tyubik on the right. */
const photo = await sharp(join(process.cwd(), "public/assets/tyubik-hero.jpg"))
  .rotate()
  .extract({ left: 0, top: 300, width: 1152, height: 1240 })
  .resize(560, 630, { fit: "cover", position: "centre" })
  .toBuffer();

const copy =
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="${PAPER}"/>
<g font-family="Arial, Helvetica, sans-serif" fill="${INK}">
  <text x="72" y="104" font-size="30" font-weight="700" letter-spacing="-1">1D</text>
  <text x="72" y="132" font-size="30" font-weight="700" letter-spacing="-1">NT</text>
  <rect x="124" y="82" width="1.5" height="54" fill="#d5d4cd"/>
  <text x="142" y="117" font-size="17" font-weight="600" letter-spacing="2.4">ONE IDENTITY</text>
  <text x="68" y="300" font-size="76" letter-spacing="-4">Your dog.</text>
  <text x="68" y="384" font-size="76" letter-spacing="-4">Your style.</text>
  <text x="66" y="470" font-size="82" font-family="Georgia, serif" font-style="italic" letter-spacing="-3">One identity.</text>
  <text x="72" y="548" font-size="22" fill="${MUTED}">Handmade BioThane® collars, leashes and harnesses</text>
</g>
</svg>`);

await sharp(copy)
  .composite([{ input: photo, left: 640, top: 0 }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(join(app, "opengraph-image.jpg"));
await writeFile(
  join(app, "opengraph-image.alt.txt"),
  "ONE IDENTITY — Your dog. Your style. One identity. Handmade BioThane® collars, leashes and harnesses.",
);

/* App icon: the stacked 1D/NT mark on ink. */
const icon = (size) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
<rect width="100" height="100" rx="22" fill="${INK}"/>
<g font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="38" fill="${PAPER}" text-anchor="middle" letter-spacing="-2">
  <text x="50" y="47">1D</text>
  <text x="50" y="80">NT</text>
</g>
</svg>`);

await sharp(icon(512)).png().toFile(join(app, "icon.png"));
await sharp(icon(180)).png().toFile(join(app, "apple-icon.png"));
console.log("opengraph-image.jpg, icon.png, apple-icon.png");
