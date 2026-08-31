async function testStorefrontHtml() {
  const urls = [
    'http://localhost:3000/shop',
    'http://localhost:3000/category/fournitures-scolaires',
    'http://localhost:3000/boutique',
  ];

  for (const url of urls) {
    console.log(`\n=== Fetching ${url} ===`);
    try {
      const res = await fetch(url);
      console.log(`Status: ${res.status} ${res.statusText}`);
      const html = await res.text();
      const hasSupabaseImg = html.includes('hcjgbrtfjbphnatqccep.supabase.co');
      const hasProductNames = html.includes('Maped') || html.includes('PILOT') || html.includes('BIC');
      console.log(`Contains Supabase Storage image URLs: ${hasSupabaseImg}`);
      console.log(`Contains scraped product titles: ${hasProductNames}`);
      console.log(`HTML length: ${html.length} characters`);
    } catch (err: any) {
      console.error(`Failed to fetch ${url}:`, err.message);
    }
  }
}

testStorefrontHtml().catch(console.error);
