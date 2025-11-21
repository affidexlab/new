const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main(){
  const src = '/project/workspace/IMG_20251121_174221.png';
  const outDir = '/project/workspace/affidexlab/new/affidexlab/new/app/public';
  fs.mkdirSync(outDir, { recursive: true });

  const fav32 = path.join(outDir, 'favicon-32.png');
  const apple256 = path.join(outDir, 'apple-touch-icon.png');

  await sharp(src).resize(32,32).png({ compressionLevel: 9 }).toFile(fav32);
  await sharp(src).resize(256,256).png({ compressionLevel: 9 }).toFile(apple256);

  console.log('Wrote:', fav32);
  console.log('Wrote:', apple256);
}

main().catch(e=>{ console.error(e); process.exit(1); });
