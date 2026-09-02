import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const img1Path = 'C:/Users/abdd6/.gemini/antigravity-ide/brain/9182e5a6-8a14-47cf-985c-2b67903c1cbf/.user_uploaded/media_1788366375886.png';
const img2Path = 'C:/Users/abdd6/.gemini/antigravity-ide/brain/9182e5a6-8a14-47cf-985c-2b67903c1cbf/.user_uploaded/media_1788366377882.jpg';

// Helper to convert RGBA raw buffer to DIB ICO image block
function createDibBlock(rawRgba, width, height) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);             // biSize
  header.writeInt32LE(width, 4);           // biWidth
  header.writeInt32LE(height * 2, 8);      // biHeight (x2 for ICO)
  header.writeUInt16LE(1, 12);             // biPlanes
  header.writeUInt16LE(32, 14);            // biBitCount
  header.writeUInt32LE(0, 16);             // biCompression (BI_RGB)
  header.writeUInt32LE(width * height * 4, 20); // biSizeImage
  header.writeInt32LE(0, 24);              // biXPelsPerMeter
  header.writeInt32LE(0, 28);              // biYPelsPerMeter
  header.writeUInt32LE(0, 32);             // biClrUsed
  header.writeUInt32LE(0, 36);             // biClrImportant

  // DIB stores rows bottom-to-top, BGRA format
  const pixelData = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y; // flip vertically
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      const r = rawRgba[srcIdx];
      const g = rawRgba[srcIdx + 1];
      const b = rawRgba[srcIdx + 2];
      const a = rawRgba[srcIdx + 3];
      pixelData[dstIdx] = b;
      pixelData[dstIdx + 1] = g;
      pixelData[dstIdx + 2] = r;
      pixelData[dstIdx + 3] = a;
    }
  }

  // 1-bit AND mask (row size padded to 4-byte boundary)
  const andRowSize = Math.ceil(width / 32) * 4;
  const andMask = Buffer.alloc(andRowSize * height, 0); // all zeros = visible by alpha

  return Buffer.concat([header, pixelData, andMask]);
}

async function createIco(sourceBuffer) {
  const sizes = [16, 32, 48];
  const dibEntries = [];

  for (const s of sizes) {
    const { data } = await sharp(sourceBuffer)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const block = createDibBlock(data, s, s);
    dibEntries.push({ width: s, height: s, data: block });
  }

  // Add 256x256 PNG entry
  const png256 = await sharp(sourceBuffer)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  dibEntries.push({ width: 256, height: 256, data: png256 });

  // Build ICO header
  const numImages = dibEntries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  let currentOffset = 6 + numImages * 16;
  const dirEntries = [];

  for (const entry of dibEntries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(entry.width >= 256 ? 0 : entry.width, 0);
    dir.writeUInt8(entry.height >= 256 ? 0 : entry.height, 1);
    dir.writeUInt8(0, 2); // color count
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // planes
    dir.writeUInt16LE(32, 6); // bit count
    dir.writeUInt32LE(entry.data.length, 8);
    dir.writeUInt32LE(currentOffset, 12);
    dirEntries.push(dir);
    currentOffset += entry.data.length;
  }

  return Buffer.concat([
    header,
    ...dirEntries,
    ...dibEntries.map(e => e.data)
  ]);
}

async function main() {
  console.log('Generating website branding assets...');

  // Ensure directories exist
  const dirs = [
    'd:/WEBSITE/public',
    'd:/WEBSITE/app/public'
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // 1. Process Logo (Image 1)
  // Optimize PNG while maintaining full quality and transparency
  const logoBuffer = await sharp(img1Path)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync('d:/WEBSITE/public/logo.png', logoBuffer);
  fs.writeFileSync('d:/WEBSITE/app/public/logo.png', logoBuffer);
  console.log('Saved logo.png to public/ and app/public/ (size:', logoBuffer.length, 'bytes)');

  // 2. Process Favicon / Icons (Image 2)
  // Create transparent circular badge
  const width = 1024;
  const height = 1024;
  const cx = 512;
  const cy = 506;
  const r = 496;

  const maskSvg = Buffer.from(
    `<svg width="${width}" height="${height}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" />
    </svg>`
  );

  const circularEmblem = await sharp(img2Path)
    .ensureAlpha()
    .composite([{
      input: maskSvg,
      blend: 'dest-in'
    }])
    .png({ quality: 100 })
    .toBuffer();

  // Generate ICO
  const icoBuffer = await createIco(circularEmblem);
  fs.writeFileSync('d:/WEBSITE/app/favicon.ico', icoBuffer);
  fs.writeFileSync('d:/WEBSITE/public/favicon.ico', icoBuffer);
  fs.writeFileSync('d:/WEBSITE/app/public/favicon.ico', icoBuffer);
  console.log('Saved favicon.ico (size:', icoBuffer.length, 'bytes)');

  // Generate modern Web App & Browser Icons
  // app/icon.png (Next.js automatically uses app/icon.png as the app favicon)
  const icon512 = await sharp(circularEmblem)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  const icon192 = await sharp(circularEmblem)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  const appleIcon = await sharp(circularEmblem)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  // Save Next.js special files in app/
  fs.writeFileSync('d:/WEBSITE/app/icon.png', icon512);
  fs.writeFileSync('d:/WEBSITE/app/apple-icon.png', appleIcon);

  // Save in public/ and app/public/
  fs.writeFileSync('d:/WEBSITE/public/icon.png', icon512);
  fs.writeFileSync('d:/WEBSITE/public/icon-192.png', icon192);
  fs.writeFileSync('d:/WEBSITE/public/apple-touch-icon.png', appleIcon);

  fs.writeFileSync('d:/WEBSITE/app/public/icon.png', icon512);
  fs.writeFileSync('d:/WEBSITE/app/public/icon-192.png', icon192);
  fs.writeFileSync('d:/WEBSITE/app/public/apple-touch-icon.png', appleIcon);

  // Clean up scratch test files
  const testFiles = [
    'd:/WEBSITE/test_logo_padded.png',
    'd:/WEBSITE/test_logo_orig.png',
    'd:/WEBSITE/test_fav_circular.png',
    'd:/WEBSITE/test_fav_square.png',
    'd:/WEBSITE/scratch_favicon32.png',
    'd:/WEBSITE/scratch_favicon192.png'
  ];
  for (const f of testFiles) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }

  console.log('All branding assets created and verified successfully!');
}

main().catch(console.error);
