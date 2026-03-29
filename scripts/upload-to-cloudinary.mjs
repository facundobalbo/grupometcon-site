#!/usr/bin/env node
/**
 * GRUPO METCON — Cloudinary Upload Script
 * =========================================
 * Sube las imágenes de assets/img/ a Cloudinary bajo la carpeta grupometcon/
 * Una vez subidas, reemplazá las rutas locales en los HTML con las URLs de Cloudinary.
 *
 * USO:
 *   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME node scripts/upload-to-cloudinary.mjs
 *
 * O con variables separadas:
 *   CLOUDINARY_CLOUD_NAME=dksm2ttkj CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=yyy node scripts/upload-to-cloudinary.mjs
 */

import { createReadStream, readdirSync, statSync } from 'fs';
import { join, basename, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const IMAGES_DIR = join(ROOT, 'assets', 'img');

// ── Parse Cloudinary credentials ──
let cloudName, apiKey, apiSecret;

if (process.env.CLOUDINARY_URL) {
  const url = new URL(process.env.CLOUDINARY_URL);
  cloudName  = url.hostname;
  apiKey     = url.username;
  apiSecret  = url.password;
} else {
  cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
  apiKey     = process.env.CLOUDINARY_API_KEY;
  apiSecret  = process.env.CLOUDINARY_API_SECRET;
}

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌  Faltan credenciales de Cloudinary.');
  console.error('   Setéalas como env vars: CLOUDINARY_URL o CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET');
  process.exit(1);
}

// ── Gather images ──
function getImages(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      getImages(full, acc);
    } else if (/\.(jpe?g|png|webp|gif)$/i.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const images = getImages(IMAGES_DIR);
console.log(`\n📁  Encontradas ${images.length} imágenes en assets/img/\n`);

// ── Upload ──
async function uploadImage(filePath) {
  const relPath = relative(IMAGES_DIR, filePath);
  // grupometcon/obras/topografia  (sin extensión)
  const publicId = `grupometcon/${relPath.replace(/\\/g, '/').replace(/\.[^.]+$/, '')}`;

  // Cloudinary signed upload requires SHA1 timestamp signature
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign    = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

  // Simple SHA1 via crypto (Node built-in)
  const { createHash } = await import('crypto');
  const signature = createHash('sha1').update(toSign).digest('hex');

  const formData = new FormData();
  const blob     = new Blob([createReadStream(filePath).read()]);  // fallback: use fetch with file
  formData.append('file', await fileToBlob(filePath));
  formData.append('public_id',  publicId);
  formData.append('api_key',    apiKey);
  formData.append('timestamp',  timestamp);
  formData.append('signature',  signature);

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (data.secure_url) {
    console.log(`✅  ${basename(filePath)}`);
    console.log(`   → ${data.secure_url}\n`);
    return { file: relPath, url: data.secure_url, publicId };
  } else {
    console.error(`❌  ${basename(filePath)}: ${JSON.stringify(data.error)}`);
    return null;
  }
}

async function fileToBlob(filePath) {
  const { readFileSync } = await import('fs');
  const buffer = readFileSync(filePath);
  return new Blob([buffer]);
}

async function main() {
  const results = [];
  for (const img of images) {
    const result = await uploadImage(img);
    if (result) results.push(result);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅  Subidas: ${results.length} / ${images.length}`);
  console.log('\n📋  Reemplazos para los HTML:');
  console.log('   Cambiá "assets/img/obras/topografia.jpg" por la URL de Cloudinary correspondiente.');
  console.log('\n💡  Tip: una vez reemplazadas las URLs, podés eliminar assets/img/obras/ del repo.');
  console.log('   Las imágenes de logo (logo-blanco.png, letra-m.png) son livianas — podés dejarlas locales.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Print mapping
  results.forEach(r => console.log(`${r.file}  →  ${r.url}`));
}

main().catch(console.error);
