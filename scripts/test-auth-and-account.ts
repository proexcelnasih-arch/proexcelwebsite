async function testAuthAndAccountRoutes() {
  const routes = [
    { url: 'http://localhost:3000/login', expectStatus: 200, name: 'Login Page' },
    { url: 'http://localhost:3000/register', expectStatus: 200, name: 'Register Page' },
    { url: 'http://localhost:3000/forgot-password', expectStatus: 200, name: 'Forgot Password Page' },
    { url: 'http://localhost:3000/reset-password', expectStatus: 200, name: 'Reset Password Page' },
    { url: 'http://localhost:3000/account', expectRedirect: true, name: 'Protected Account Page' },
    { url: 'http://localhost:3000/admin', expectStatus: 200, name: 'Admin Dashboard' },
    { url: 'http://localhost:3000/admin/products', expectStatus: 200, name: 'Admin Products Table' },
  ];

  console.log('=== Testing Auth & Account Routes ===\n');

  for (const r of routes) {
    try {
      const res = await fetch(r.url, { redirect: 'manual' });
      console.log(`[${r.name}] URL: ${r.url}`);
      console.log(`  Status: ${res.status} ${res.statusText}`);
      if (res.headers.get('location')) {
        console.log(`  Redirect Location: ${res.headers.get('location')}`);
      }
      const text = await res.text();
      console.log(`  Response length: ${text.length} bytes\n`);
    } catch (err: any) {
      console.error(`Failed to fetch ${r.url}:`, err.message);
    }
  }
}

testAuthAndAccountRoutes().catch(console.error);
