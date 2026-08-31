import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('fourniture_57.json', 'utf-8'));
console.log('Total items in fourniture_57.json:', data.length);

const indices = [0, 10, 35, 70, 105, 140, 175, 210, 245, 280, 315, 350, 385, 420, 455, 484];

console.log('\n--- SAMPLE ENTRIES SPOT-CHECK (16 items across the dataset) ---');
indices.forEach((idx) => {
  if (data[idx]) {
    console.log(`[Item #${idx + 1}]`);
    console.log(`  Name:     "${data[idx].name}"`);
    console.log(`  Price:    ${data[idx].price} MAD`);
    console.log(`  Category: ${data[idx].category_slug}`);
    console.log(`  Image:    ${data[idx].source_image_url}`);
  }
});

const zeroPrices = data.filter((d: any) => d.price <= 0);
console.log('\n--- QUALITY AUDIT ---');
console.log('Zero or negative prices:', zeroPrices.length);
const emptyNames = data.filter((d: any) => !d.name || d.name.trim() === '');
console.log('Empty names:', emptyNames.length);
const emptyImages = data.filter((d: any) => !d.source_image_url || d.source_image_url.trim() === '');
console.log('Empty image URLs:', emptyImages.length);
