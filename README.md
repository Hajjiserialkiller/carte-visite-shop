# Cartelier — Business Card E-commerce

A production-style e-commerce store for a business card ("carte visite") printing company, built as a **full-stack React + Node** application with a multilingual (EN / FR / AR) UI, a live card designer, cart, and Stripe-ready checkout.

```
carte-visite-shop/
├─ backend/    Node.js + Express + TypeScript + Prisma (PostgreSQL) + Zod + Stripe
└─ frontend/   React 18 + Vite + TypeScript + Tailwind + i18next (RTL support)
```

---

## Quick start

### 0. Database (PostgreSQL)

```bash
docker compose up -d          # postgres:16-alpine on :5432 (cartelier/cartelier)
```

### 1. Backend (port 4000)

```bash
cd backend
npm install
cp .env.example .env          # Windows: copy .env.example .env
npx prisma migrate deploy     # applies migrations (or: npx prisma migrate dev)
npm run db:seed               # seeds 8 products + pricing tiers
npm run dev                   # API at http://localhost:4000
```

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev                   # app at http://localhost:5173
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the backend.

> If your npm blocks postinstall scripts, approve them:
> `npm install-scripts approve prisma @prisma/engines @prisma/client esbuild`

## Admin dashboard

Visit http://localhost:5173/admin and sign in with the `ADMIN_TOKEN` from `backend/.env` (`cartelier-demo-admin-token` in dev). Manage products (create/edit/delete, tiered pricing) and order status (PENDING / CONFIRMED / CANCELLED).

---

## Features

| Area | Details |
|---|---|
| **Catalog** | 8 products across 6 categories (classic, premium, metal, transparent, luxury, eco), search + category filters, tiered pricing (50/100/250/500 cards) |
| **Card designer** | 4 templates (classic, minimal, bold, elegant), live preview at true 85×55mm ratio, background + accent colors (swatches or color picker), 6 typography options (incl. Arabic fonts Cairo/Amiri), 7 text fields |
| **Cart** | Drawer with quantity editing, localStorage persistence, free-shipping threshold |
| **Checkout** | Shipping form with validation; Stripe Checkout when configured, demo mode otherwise |
| **Orders** | Server-side order creation with pricing recomputed from the DB (client prices are never trusted), reference lookup, payment verification |
| **i18n** | English, French, Arabic with automatic RTL layout |
| **Design** | Print-atelier aesthetic: ink/ivory/gold palette, Playfair Display + Inter, generated SVG product mockups |

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products?category=&search=&featured=` | List active products |
| GET | `/api/products/categories` | Category counts |
| GET | `/api/products/:slug` | Product detail |
| POST | `/api/orders` | Create order (validated + server-priced) |
| GET | `/api/orders/:reference` | Order status |
| GET | `/api/orders/:reference/verify` | Verify Stripe payment, confirm order |
| GET | `/api/health` | Health check |
| GET | `/api/admin/products` | List products (admin) |
| POST | `/api/admin/products` | Create product (admin) |
| PATCH | `/api/admin/products/:id` | Update product (admin) |
| DELETE | `/api/admin/products/:id` | Delete product (admin) |
| GET | `/api/admin/orders?status=` | List orders, filter by status (admin) |
| PATCH | `/api/admin/orders/:id` | Update order status (admin) |

## Security measures

- **Server-side pricing** — order totals are recomputed from the database; client-sent prices are ignored
- **Input validation** — Zod schemas on every order field (email, lengths, hex colors, template whitelist, quantity bounds)
- **Helmet** security headers, strict **CORS** origin allowlist, **rate limiting** (global + per-IP order limit)
- **Stripe verification** — orders only become `CONFIRMED` after the payment session is verified server-side
- **No secrets in code** — all configuration via `.env` (see `.env.example`); secret keys are never logged
- Prisma parameterized queries (SQL-injection safe), React output escaping (XSS safe), body-size limit, no `x-powered-by` header

## Payments (Stripe)

Without a key, checkout runs in **demo mode**: orders are confirmed instantly and no payment is taken (shown in the UI).

To enable real payments:

```bash
# backend/.env
STRIPE_SECRET_KEY=sk_test_...
```

Then `POST /api/orders` returns a `checkoutUrl`; the frontend redirects there and the success page calls `/verify` to confirm the order. Optional: add a webhook endpoint for async confirmation in production.

## Scripts

```bash
# Backend
npm run dev          # tsx watch
npm run build        # tsc → dist/
npm run typecheck
npm run db:migrate   # prisma migrate dev (applies pending migrations)
npm run db:seed
npm test             # 35 unit/integration tests (Vitest, uses cartelier_test DB)

# Frontend
npm run dev
npm run build        # typecheck + vite build
npm run typecheck
npm test             # 22 unit tests (Vitest + Testing Library)
npm run test:e2e     # 3 end-to-end tests (Playwright; starts both servers)

# Database
docker compose up -d
docker compose down   # stops the container (data kept in pgdata volume)
```

Unit tests for the backend reset a dedicated `cartelier_test` database, so they never touch dev data. E2E tests run against the dev database and are safe to repeat (the admin test uses a unique product slug per run).

## Going to production

- Use a managed PostgreSQL instance: swap `DATABASE_URL`, then `prisma migrate deploy`
- Set `NODE_ENV=production`, real `CORS_ORIGINS`, Stripe webhook + queue for async order confirmation
- Serve `frontend/dist` via the backend (static) or CDN; add `Cache-Control` headers on images
- Change `ADMIN_TOKEN` to a long random string and serve the admin route over HTTPS only
