// Builds tiny blurred previews for every photo in public/assets.
// Run after adding or replacing photos: node scripts/media/generate-image-placeholders.mjs
import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const assets = join(process.cwd(), "public/assets");
const output = join(
  process.cwd(),
  "src/features/storefront/data/image-placeholders.json",
);

const files = (await readdir(assets))
  .filter((name) => /\.(webp|jpe?g|png)$/i.test(name))
  .sort();

const placeholders = {};
for (const name of files) {
  const buffer = await sharp(join(assets, name))
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  placeholders[`/assets/${name}`] =
    `data:image/webp;base64,${buffer.toString("base64")}`;
}

await writeFile(output, `${JSON.stringify(placeholders, null, 2)}\n`);
console.log(`${files.length} placeholders → ${output}`);
