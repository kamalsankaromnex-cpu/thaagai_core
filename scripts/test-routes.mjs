import { db } from "../src/lib/db.ts";
import { signToken } from "../src/server/auth/auth.ts";
import { signCustomerToken } from "../src/server/auth/customer-auth.ts";

async function run() {
  const products = await db.product.findMany({ select: { id: true, slug: true }, take: 10 });
  const categories = await db.category.findMany({ select: { id: true, slug: true }, take: 10 });
  const orders = await db.orderRequest.findMany({ select: { id: true, reference: true }, take: 5 });
  const customers = await db.customer.findMany({ select: { id: true }, take: 5 });

  const adminToken = signToken({
    id: "admin-owner-test",
    email: "owner@thaagai.com",
    name: "Thaagai Owner",
    role: "OWNER",
    exp: Math.floor(Date.now() / 1000) + 3600
  });

  const customerToken = signCustomerToken({
    customerId: customers[0]?.id || "cust-test",
    mobileNumber: "9876543210"
  });

  const testCases = [
    // Public Storefront
    { url: '/', headers: {} },
    { url: '/about', headers: {} },
    { url: '/cart', headers: {} },
    { url: '/checkout', headers: {} },
    { url: '/contact', headers: {} },
    { url: '/custom-made', headers: {} },
    { url: '/fit-finder', headers: {} },
    { url: '/login', headers: {} },
    { url: '/lookbook', headers: {} },
    { url: '/privacy-policy', headers: {} },
    { url: '/return-refund-policy', headers: {} },
    { url: '/shipping-and-returns', headers: {} },
    { url: '/shipping-policy', headers: {} },
    { url: '/shop', headers: {} },
    { url: '/shop?category=straight-cut-churidars', headers: {} },
    { url: '/shop?type=READY_TO_WEAR', headers: {} },
    { url: '/shop?sort=price_asc', headers: {} },
    { url: '/size-to-length', headers: {} },
    { url: '/terms', headers: {} },
    { url: '/track-order', headers: {} },
    { url: '/wishlist', headers: {} },
    { url: '/3d-studio', headers: {} },
    { url: '/sitemap.xml', headers: {} },
    { url: '/robots.txt', headers: {} },

    // Dynamic Product & Category pages
    ...products.map(p => ({ url: `/product/${p.slug}`, headers: {} })),
    ...categories.map(c => ({ url: `/category/${c.slug}`, headers: {} })),

    // Customer Account pages (with customer session)
    { url: '/account', headers: { Cookie: `thaagai_customer_session=${customerToken}` } },
    { url: '/account/addresses', headers: { Cookie: `thaagai_customer_session=${customerToken}` } },
    { url: '/account/measurements', headers: { Cookie: `thaagai_customer_session=${customerToken}` } },
    { url: '/account/orders', headers: { Cookie: `thaagai_customer_session=${customerToken}` } },
    ...(orders.length > 0 ? [{ url: `/account/orders/${orders[0].id}`, headers: { Cookie: `thaagai_customer_session=${customerToken}` } }] : []),
    ...(orders.length > 0 ? [{ url: `/order-success/${orders[0].reference}`, headers: {} }] : []),

    // Admin Pages (with admin session)
    { url: '/admin', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/login', headers: {} },
    { url: '/admin/products', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/products/new', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    ...(products.length > 0 ? [{ url: `/admin/products/${products[0].id}`, headers: { Cookie: `thaagai_admin_session=${adminToken}` } }] : []),
    { url: '/admin/categories', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/inventory', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/fabrics', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/orders', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    ...(orders.length > 0 ? [{ url: `/admin/orders/${orders[0].id}`, headers: { Cookie: `thaagai_admin_session=${adminToken}` } }] : []),
    { url: '/admin/customers', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    ...(customers.length > 0 ? [{ url: `/admin/customers/${customers[0].id}`, headers: { Cookie: `thaagai_admin_session=${adminToken}` } }] : []),
    { url: '/admin/finance', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/hero-slides', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/promotions', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/purchases', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/reviews', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/settings', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/size-charts', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/staff', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/admin/suppliers', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },

    // GET API Endpoints
    { url: '/api/categories', headers: {} },
    { url: '/api/fabrics', headers: {} },
    { url: '/api/size-charts', headers: {} },
    { url: '/api/health', headers: {} },
    { url: '/api/feeds/google-shopping', headers: {} },
    { url: '/api/shipping/estimate?pin=600004', headers: {} },
    { url: '/api/postal-codes/600004', headers: {} },
    { url: '/api/admin/categories', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/products', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/inventory', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/fabrics', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/orders', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/customers', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/finance', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/hero-slides', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/promotions', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/purchases', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/reviews', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/settings', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/size-charts', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/staff', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/suppliers', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/announcement', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/admin/search?q=cotton', headers: { Cookie: `thaagai_admin_session=${adminToken}` } },
    { url: '/api/customers/me', headers: { Cookie: `thaagai_customer_session=${customerToken}` } },
    { url: '/api/customers/me/addresses', headers: { Cookie: `thaagai_customer_session=${customerToken}` } },
    { url: '/api/customers/measurements', headers: { Cookie: `thaagai_customer_session=${customerToken}` } },
  ];

  console.log(`Running deep test on ${testCases.length} endpoints...`);

  const failures = [];
  for (const tc of testCases) {
    try {
      const res = await fetch(`http://localhost:3000${tc.url}`, {
        redirect: 'manual',
        headers: {
          'Accept': 'text/html,application/json,*/*',
          ...tc.headers
        }
      });
      const text = await res.text();
      const is500 = res.status >= 500 || 
                    text.includes('Internal Server Error') || 
                    text.includes('Application error: a client-side exception has occurred') || 
                    text.includes('Application error: a server-side exception has occurred');
      
      if (is500) {
        console.error(`[CRITICAL ERROR ${res.status}] ${tc.url}`);
        console.error(text.slice(0, 400));
        failures.push({ url: tc.url, status: res.status, error: text.slice(0, 400) });
      } else {
        console.log(`[PASS ${res.status}] ${tc.url}`);
      }
    } catch (err) {
      console.error(`[REQUEST FAILED] ${tc.url}:`, err.message);
      failures.push({ url: tc.url, status: 0, error: err.message });
    }
  }

  console.log(`\n=================== RESULTS ===================`);
  console.log(`Total Tested: ${testCases.length}`);
  console.log(`Successful: ${testCases.length - failures.length}`);
  console.log(`Errors: ${failures.length}`);
  if (failures.length > 0) {
    console.log(`\nFAILED ENDPOINTS:`);
    for (const f of failures) {
      console.log(` -> ${f.status} ${f.url}`);
    }
  }
}

run().catch(console.error).finally(() => process.exit(0));
