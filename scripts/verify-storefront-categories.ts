import * as cheerio from 'cheerio';

async function verifyStorefront() {
  console.log('============================================================');
  console.log('STOREFRONT VERIFICATION');
  console.log('============================================================');

  // ── 1. Verify Subcategory Page /category/cahier-carnet-bloc-note
  console.log('\n--- 1. Testing /category/cahier-carnet-bloc-note ---');
  const subRes = await fetch('http://localhost:3000/category/cahier-carnet-bloc-note');
  console.log(`HTTP Status: ${subRes.status} ${subRes.statusText}`);
  const subHtml = await subRes.text();
  const $sub = cheerio.load(subHtml);

  const subH1 = $sub('h1').text().trim();
  console.log(`Page H1: "${subH1}"`);

  // Check breadcrumbs
  const breadcrumbItems: string[] = [];
  $sub('nav[aria-label="Fil d\'Ariane"] li').each((_, el) => {
    breadcrumbItems.push($sub(el).text().replace(/\//g, '').trim());
  });
  console.log(`Breadcrumbs: ${breadcrumbItems.join(' > ')}`);

  // Check parent link
  const parentLink = $sub('a[href="/category/fournitures-scolaires"]').first().text().trim();
  console.log(`Parent navigation link: "${parentLink}"`);

  // Check product count in text
  let subCountText = '';
  $sub('p').each((_, el) => {
    const t = $sub(el).text().trim().replace(/\s+/g, ' ');
    if (t.includes('résultats')) subCountText = t;
  });
  console.log(`Results text: "${subCountText}"`);

  // Check image sources
  const subImages: string[] = [];
  $sub('img[src*="supabase"]').each((_, el) => {
    subImages.push($sub(el).attr('src') || '');
  });
  console.log(`Supabase Storage images rendered on Page 1: ${subImages.length}`);
  if (subImages.length > 0) {
    console.log(`Sample image URL: ${subImages[0].slice(0, 90)}...`);
  }

  // Check pagination
  let subPagination: string[] = [];
  $sub('nav button, nav a').each((_, el) => {
    const t = $sub(el).text().trim();
    if (t && !isNaN(Number(t))) subPagination.push(t);
  });
  console.log(`Pagination pages detected: ${subPagination.join(', ')} (Last page: ${subPagination[subPagination.length - 1] || '1'})`);

  // ── 2. Verify Parent Category Page /category/fournitures-scolaires
  console.log('\n--- 2. Testing /category/fournitures-scolaires ---');
  const parentRes = await fetch('http://localhost:3000/category/fournitures-scolaires');
  console.log(`HTTP Status: ${parentRes.status} ${parentRes.statusText}`);
  const parentHtml = await parentRes.text();
  const $parent = cheerio.load(parentHtml);

  const parentH1 = $parent('h1').text().trim();
  console.log(`Page H1: "${parentH1}"`);

  // Check subcategories chips
  const subcatLinks: { href: string; text: string }[] = [];
  $parent('a[href*="cahier"]').each((_, el) => {
    subcatLinks.push({
      href: $parent(el).attr('href') || '',
      text: $parent(el).text().trim(),
    });
  });
  console.log(`Subcategory link to Cahier, Carnet et Bloc-Note present on parent page:`, subcatLinks);

  // Check product count on parent page
  let parentCountText = '';
  $parent('p').each((_, el) => {
    const t = $parent(el).text().trim().replace(/\s+/g, ' ');
    if (t.includes('résultats')) parentCountText = t;
  });
  console.log(`Parent category results text: "${parentCountText}"`);

  console.log('\n============================================================');
  console.log('VERIFICATION COMPLETE');
  console.log('============================================================');
}

verifyStorefront().catch(console.error);
