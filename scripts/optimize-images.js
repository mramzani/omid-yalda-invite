#!/usr/bin/env node
/**
 * Converts every photo in assets/gallery/raw/ into two WebP sizes:
 *   assets/gallery/<name>-600.webp   (thumbnail, 600px wide)
 *   assets/gallery/<name>-1600.webp  (full, max 1600px on the longest side)
 * and prints a `gallery: [...]` snippet to paste into CONFIG in js/main.js.
 *
 * Usage:  npm install && npm run images
 *         node scripts/optimize-images.js [--quality 78] [--clean]
 */
'use strict';

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('sharp is not installed. Run: npm install');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'assets/gallery/raw');
const OUT_DIR = path.join(ROOT, 'assets/gallery');
const EXT = /\.(jpe?g|png|webp|tiff?|avif|heic|heif)$/i;

const args = process.argv.slice(2);
const qIndex = args.indexOf('--quality');
const QUALITY = qIndex > -1 ? Number(args[qIndex + 1]) || 78 : 78;
const CLEAN = args.includes('--clean');

const slug = (name) =>
  name
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[^\w؀-ۿ-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'photo';

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function main() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Folder not found: ${RAW_DIR}`);
    process.exit(1);
  }
  const files = fs.readdirSync(RAW_DIR).filter((f) => EXT.test(f)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) {
    console.error('No images found in assets/gallery/raw/');
    process.exit(1);
  }

  if (CLEAN) {
    fs.readdirSync(OUT_DIR)
      .filter((f) => /-(600|1600)\.webp$/.test(f))
      .forEach((f) => fs.unlinkSync(path.join(OUT_DIR, f)));
  }

  const entries = [];
  for (const [i, file] of files.entries()) {
    const src = path.join(RAW_DIR, file);
    const name = slug(file);
    const thumbPath = path.join(OUT_DIR, `${name}-600.webp`);
    const fullPath = path.join(OUT_DIR, `${name}-1600.webp`);

    const base = sharp(src, { failOn: 'none' }).rotate(); // honour EXIF orientation

    const full = await base
      .clone()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(fullPath);

    const thumb = await base
      .clone()
      .resize({ width: 600, withoutEnlargement: true })
      .webp({ quality: QUALITY - 4, effort: 5 })
      .toFile(thumbPath);

    const wide = full.width / full.height > 1.2;
    entries.push({ name, w: full.width, h: full.height, wide, n: i + 1 });
    console.error(`✓ ${file} → ${name}  (thumb ${kb(thumb.size)}, full ${kb(full.size)}, ${full.width}×${full.height})`);
  }

  const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const lines = entries.map((e) =>
    `    { thumb: 'assets/gallery/${e.name}-600.webp', full: 'assets/gallery/${e.name}-1600.webp', ` +
    `w: ${e.w}, h: ${e.h}, alt: 'عکس ${fa(e.n)}'${e.wide ? ', wide: true' : ''} },`);

  console.log('\n// ↓ paste into CONFIG in js/main.js');
  console.log('  gallery: [');
  console.log(lines.join('\n'));
  console.log('  ],');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
