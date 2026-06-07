import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = path.resolve();
const publicDir = path.join(root, 'public');
const svgPath = path.join(publicDir, 'favicon.svg');
const outPath = path.join(publicDir, 'favicon.ico');

async function main() {
  const svg = await fs.readFile(svgPath);
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map((s) => sharp(svg).resize(s, s, { fit: 'contain' }).png().toBuffer()),
  );

  const ico = await pngToIco(pngBuffers);
  await fs.writeFile(outPath, ico);
  console.log('Wrote', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
