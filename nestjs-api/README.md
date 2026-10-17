# Thaagai Customer Storefront REST API (NestJS)

Modular NestJS backend REST API providing complete customer storefront capabilities for **Thaagai** Indian clothing & handcrafted jewellery e-commerce:

1. **Authentication (`/auth`)**:
   - `POST /auth/otp/request`: Issue 6-digit OTP to Indian mobile number (`+91`).
   - `POST /auth/otp/verify`: Verify OTP, auto-create customer account, and set HTTP-only cookie.
   - `GET /auth/session`: Retrieve authenticated customer session.
   - `POST /auth/logout`: Revoke customer session cookie.

2. **Customer Profile (`/customers`)**:
   - `GET /customers/me`: Authenticated profile with verified mobile status.
   - `PATCH /customers/me`: Update full name and email address.

3. **Addresses (`/customers/me/addresses`)**:
   - `GET /customers/me/addresses`: List saved addresses for customer.
   - `POST /customers/me/addresses`: Save new delivery address with PIN autofill.
   - `PATCH /customers/me/addresses/:id`: Edit address.
   - `DELETE /customers/me/addresses/:id`: Remove address.
   - `PATCH /customers/me/addresses/:id/default`: Set default address.

4. **Postal PIN Codes (`/postal-codes`)**:
   - `GET /postal-codes/:pin`: India Post PIN lookup with localities, district, state.

5. **Customer Orders (`/orders`)**:
   - `GET /orders`: View customer order history (filterable by status: `all`, `active`, `delivered`, `cancelled`).
   - `POST /orders`: Place order request with server-calculated prices and immutable address snapshot.
   - `GET /orders/:id`: Single order detail with status timeline and reorder validation.

## Running Standalone

```bash
cd nestjs-api
npm install
npm run start:dev
```
