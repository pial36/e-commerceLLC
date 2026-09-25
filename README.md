# Masud Rana LLC — Kitchen E-Commerce

Full-stack kitchen products store + admin panel. Next.js 16 (App Router), TypeScript, Tailwind, Prisma/MongoDB, NextAuth v5, Stripe, Cloudinary.

> **Money:** all amounts are stored and computed as **integer cents** (e.g. `6994` = $69.94) to avoid floating-point rounding. Dollars appear only in form inputs; conversion happens at the boundary (`toCents` / `fromCents` / `formatPrice` in `src/lib/utils.ts`).

## Features

**Storefront**
- Landing page — hero, categories, bestsellers, newsletter
- Catalog with search, category / price / rating filters, sorting, pagination
- Product detail — image gallery, variants, specs, reviews, related items
- Cart (Zustand, persisted) + drawer, checkout with address form + promo codes
- Auth (credentials + Google), account: profile, order history, saved addresses

**Admin panel** (`/admin`, `ADMIN` role only)
- Dashboard — sales chart (Recharts), stat cards, low-stock alerts, top categories, recent orders
- Products CRUD — multi-image upload (Cloudinary), variants editor, SKU, price/discount, stock
- Orders — status filter + inline status update, order detail, printable invoice
- Customers list, categories & brands management

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn-style Radix UI |
| State | Zustand (cart) + TanStack Query |
| ORM / DB | Prisma + MongoDB (Atlas) |
| Auth | NextAuth v5 (Auth.js), JWT + role |
| Payments | Stripe Checkout + webhook |
| Uploads | Cloudinary (signed direct upload) |

## Local Setup

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
#   set DATABASE_URL, AUTH_SECRET (npx auth secret), etc.

# 3. Database
npm run db:push      # push schema
npm run db:seed      # seed categories, products, admin user

# 4. Run
npm run dev          # http://localhost:3000
```

**Seeded admin:** `admin@masudrana.com` / `admin1234` → `/admin`

> Without a database the storefront and admin render populated **demo data** (Unsplash images) so you can preview the UI immediately. Real data takes over once seeded.

## Environment Variables

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | MongoDB connection string (Atlas or replica set) |
| `AUTH_SECRET` | ✅ | `npx auth secret` |
| `NEXTAUTH_URL` | ✅ | e.g. `http://localhost:3000` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | — | Google OAuth |
| `STRIPE_SECRET_KEY` | — | Enables real payment; without it checkout uses a demo flow |
| `STRIPE_WEBHOOK_SECRET` | — | For `/api/webhooks/stripe` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | — | Admin image upload; without it, paste image URLs |
| `NEXT_PUBLIC_APP_URL` | ✅ | Absolute app URL for Stripe redirects |

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Serve production build |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── (storefront)/     # public store + cart/checkout/account
│   ├── (auth)/           # login, register
│   ├── (admin)/admin/    # dashboard, products, orders, customers, categories
│   ├── (invoice)/        # printable invoice (ADMIN)
│   └── api/              # auth, stripe webhook, upload sign
├── components/
│   ├── ui/               # Radix-based primitives
│   ├── storefront/       # navbar, cart, product card/detail, filters
│   └── admin/            # sidebar, charts, forms, tables
├── server/
│   ├── services/         # DB reads (product, order, admin)
│   └── actions/          # server actions (auth, checkout, admin CRUD)
├── lib/                  # prisma, auth, stripe, cloudinary, utils, demo data
├── store/                # Zustand cart
└── proxy.ts              # route guards (admin/account/invoice)
```

## Deploy — Vercel + MongoDB Atlas

1. **Database (Atlas)** — create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), add a database user, allow network access (0.0.0.0/0 for Vercel), copy the connection string → `DATABASE_URL`.
2. **Push schema:** locally run `npm run db:push` against the Atlas URL (then `npm run db:seed` once).
3. **Cloudinary** — create an account, copy cloud name / API key / secret.
4. **Vercel** — import the repo, add all env vars from the table above. Set `NEXTAUTH_URL` + `NEXT_PUBLIC_APP_URL` to your Vercel domain.
5. **Deploy.** Build runs `prisma generate && next build`.
6. **Stripe webhook** — add endpoint `https://<domain>/api/webhooks/stripe` for event `checkout.session.completed`, copy the signing secret → `STRIPE_WEBHOOK_SECRET`.

### Notes
- MongoDB requires a **replica set** (Atlas provides this by default) — needed for Prisma.
- `db push` only (Prisma has no `migrate` for MongoDB).
- `AUTH_SECRET` must be set in production or auth fails.
- Turbopack build is the default (`next build`).

## Security

- Admin routes guarded in `proxy.ts` (middleware) **and** every admin server action re-checks `role === "ADMIN"` (defense in depth).
- Cloudinary uploads are signed server-side (`/api/upload/sign`, admin-only) — the API secret never reaches the browser.
- Prices stored as integer **cents**; order line items and shipping address are snapshotted at purchase so later product edits don't alter order history.

---

Built with Next.js. Payment execution requires your own live Stripe keys.
