# Thaagai — Custom E-Commerce Web Platform

Custom e-commerce web platform for **Thaagai**, an Indian clothing and jewellery brand.

---

## 1. Locked Decisions & Core Principles

- **No WhatsApp API**: Thaagai uses only the official `wa.me` link format (`https://wa.me/{number}?text={encoded}`). The store owner confirms all orders manually.
- **Stock Reservation**: Stock is **not** reserved when an order request is created. Stock is only deducted when the seller confirms the order in the admin dashboard (atomic conditional decrement `stockQuantity: { gte: quantity }`).
- **Server-Side Pricing**: Prices, variant overrides, stock counts, and totals are computed strictly on the server from the database. Browser input is never trusted.
- **No Fake Success**: We never claim a message was sent or an order was confirmed simply because a button was clicked.
- **Truthful Data**: No invented products, fabricated customer reviews, or fictitious sales figures. Seed data contains strictly labelled `[Sample]` products, store owner account, and default settings.
- **Mobile First**: 360px minimum viewport width, 44px minimum touch targets, sticky navigation, accessible drawer patterns, and proper numeric/tel input types.

---

## 2. Technology Stack & Exact Versions

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.5.28` | SSR, Static Generation, Server Actions & Route Handlers |
| **Language** | TypeScript (Strict) | `5.7.3` | Strict type safety across client and server |
| **UI Library** | React | `19.0.0` | Modern React with Server Components |
| **Styling** | Tailwind CSS | `3.4.17` | Utility-first styling with custom brand palette |
| **Database ORM** | Prisma | `6.19.3` | Schema management, type-safe queries, migrations |
| **Database** | PostgreSQL | `16` | Relational transactional database |
| **Validation** | Zod | `3.24.2` | Runtime schema validation for env and orders |
| **Unit Testing**| Vitest | `3.2.7` | High-speed unit and integration test runner |
| **Admin Auth** | Better Auth | `1.7.9` (Phase 2) | Admin authentication & session management |
| **E2E Testing** | Playwright | Configured in later phases | End-to-end browser testing |

---

## 3. Brand Design System

Thaagai's aesthetic reflects Indian textile and temple jewellery heritage:

| Role | Color Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | Warm Ecru | `#FAF7F2` | Primary page canvas |
| **Brand Accent**| Deep Wine | `#6D1833` | Brand logos, primary CTA buttons, headlines |
| **Accent** | Subtle Gold | `#B89A62` | Borders, highlights, focus rings, badges |
| **Text** | Charcoal Ink | `#262321` | High contrast body typography |
| **Container** | Sand Neutral | `#EDE5DA` | Card backgrounds, subtle dividers |
| **Line** | Muted Sand | `#D9CFC1` | Borders and dividers |

Typography:
- **Serif / Brand**: `Cormorant Garamond` (Headings, logo, accents)
- **Sans-Serif**: `Noto Sans` (Body text, UI elements, inputs)
- **Indic Script**: `Noto Sans Tamil`

---

## 4. Local Development

### Prerequisites
- Node.js `v22.x` or higher
- Docker Desktop (or local PostgreSQL 16)

### Setup Steps
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Start local PostgreSQL via Docker:
   ```bash
   docker compose up -d
   ```
4. Run Prisma database migrations:
   ```bash
   npm run db:migrate
   ```
5. Seed database (owner account, categories, and sample products):
   ```bash
   npm run db:seed
   ```
6. Start development server:
   ```bash
   npm run dev
   ```

---

## 5. Available Scripts

- `npm run dev`: Start Next.js development server
- `npm run build`: Compile and build production-ready application
- `npm run start`: Start production server
- `npm run typecheck`: Run TypeScript compiler check without emitting files (`tsc --noEmit`)
- `npm run lint`: Run ESLint checks
- `npm run test`: Run Vitest unit tests
- `npm run db:generate`: Regenerate Prisma Client
- `npm run db:migrate`: Run Prisma migrations against database
- `npm run db:seed`: Execute the safe seed script
