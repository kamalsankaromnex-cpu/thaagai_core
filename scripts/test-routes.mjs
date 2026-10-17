import { db } from "../src/lib/db.ts";

async function run() {
  const products = await db.product.findMany({ select: { slug: true }, take: 5 });
  const categories = await db.category.findMany({ select: { slug: true }, take: 5 });

  const routes = [
    '/',
    '/about',
    '/account',
    '/account/addresses',
    '/account/measurements',
    '/account/orders',
    '/cart',
    '/checkout',
    '/contact',
    '/custom-made',
    '/fit-finder',
    '/login',
    '/lookbook',
    '/privacy-policy',
    '/return-refund-policy',
    '/shipping-and-returns',
    '/shipping-policy',
    '/shop',
    '/size-to-length',
    '/terms',
    '/track-order',
    '/wishlist',
    '/3d-studio',
    '/admin',
    '/admin/login',
    '/admin/products',
    '/admin/categories',
    '/admin/inventory',
    '/admin/fabrics',
    '/admin/orders',
    '/admin/customers',
    '/admin/finance',
    '/admin/hero-slides',
    '/admin/promotions',
    '/admin/purchases',
    '/admin/reviews',
    '/admin/settings',
    '/admin/size-charts',
    '/admin/staff',
    '/admin/suppliers',
    ...products.map(p => `/product/${p.slug}`),
    ...categories.map(c => `/category/${c.slug}`)
  ];

  console.log(`Testing ${routes.length} routes against http://localhost:3000 ...`);

  const results = [];
  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`, {
        redirect: 'manual',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      const text = await res.text();
      const isError = res.status >= 500 || text.includes('Internal Server Error') || text.includes('Application error: a client-side exception has occurred') || text.includes('Application error: a server-side exception has occurred');
      
      results.push({ route: r, status: res.status, isError, snippet: isError ? text.slice(0, 500) : '' });
      if (isError) {
        console.error(`[ERROR ${res.status}] ${r}`);
        console.error(text.slice(0, 500));
      } else {
        console.log(`[OK ${res.status}] ${r}`);
      }
    } catch (err) {
      console.error(`[FAILED] ${r}:`, err.message);
      results.push({ route: r, status: 0, isError: true, snippet: err.message });
    }
  }

  const errors = results.filter(r => r.isError);
  console.log(`\n=================== SUMMARY ===================`);
  console.log(`Total Routes: ${routes.length}`);
  console.log(`Passed: ${routes.length - errors.length}`);
  console.log(`Failed: ${errors.length}`);
  if (errors.length > 0) {
    console.log(`Failing routes:`);
    for (const e of errors) {
      console.log(` - ${e.status} ${e.route}`);
    }
  }
}

run().catch(console.error).finally(() => process.exit(0));
