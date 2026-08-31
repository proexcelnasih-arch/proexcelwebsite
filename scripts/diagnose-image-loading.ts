async function diagnose() {
  const testSupabaseUrl = 'https://hcjgbrtfjbphnatqccep.supabase.co/storage/v1/object/public/product-images/stylo-a-plume-bleu-cartouche-1788133020916.jpg';
  const testUnsplashUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=1000&fit=crop&q=85';

  console.log('--- 1. Testing direct HTTP fetch to Supabase Storage ---');
  try {
    const directRes = await fetch(testSupabaseUrl);
    console.log('Direct Supabase status:', directRes.status, directRes.statusText);
    console.log('Direct Supabase Content-Type:', directRes.headers.get('content-type'));
    console.log('Direct Supabase Content-Length:', directRes.headers.get('content-length'));
  } catch (err: any) {
    console.error('Direct fetch failed:', err.message);
  }

  console.log('\n--- 2. Testing Next.js Image Optimizer for Supabase Storage ---');
  try {
    const nextImageUrl = `http://localhost:3000/_next/image?url=${encodeURIComponent(testSupabaseUrl)}&w=640&q=75`;
    console.log('Fetching:', nextImageUrl);
    const nextRes = await fetch(nextImageUrl);
    console.log('Next.js optimizer status:', nextRes.status, nextRes.statusText);
    if (!nextRes.ok) {
      const text = await nextRes.text();
      console.log('Next.js optimizer error body:', text);
    } else {
      console.log('Next.js optimizer succeeded! Content-Type:', nextRes.headers.get('content-type'));
    }
  } catch (err: any) {
    console.error('Next.js image fetch failed:', err.message);
  }

  console.log('\n--- 3. Testing Next.js Image Optimizer for Unsplash ---');
  try {
    const nextUnsplashUrl = `http://localhost:3000/_next/image?url=${encodeURIComponent(testUnsplashUrl)}&w=640&q=75`;
    console.log('Fetching:', nextUnsplashUrl);
    const nextRes2 = await fetch(nextUnsplashUrl);
    console.log('Next.js optimizer status (Unsplash):', nextRes2.status, nextRes2.statusText);
    if (!nextRes2.ok) {
      const text = await nextRes2.text();
      console.log('Next.js optimizer error body:', text);
    } else {
      console.log('Next.js optimizer succeeded (Unsplash)! Content-Type:', nextRes2.headers.get('content-type'));
    }
  } catch (err: any) {
    console.error('Next.js image fetch failed (Unsplash):', err.message);
  }
}

diagnose().catch(console.error);
