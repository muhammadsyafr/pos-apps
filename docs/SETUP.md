# CloudPOS — Fresh Setup Guide

How to set up CloudPOS on a new environment with a fresh database.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or bun

## 1. Clone & Install

```bash
git clone <repo-url> cloudpos
cd cloudpos
npm install
```

## 2. Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@host:5432/cloudpos?schema=public
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

## 3. Database Setup

Two options — choose one:

### Option A: Push Schema Directly (recommended for new DBs)

```bash
npx prisma db push
```

This creates all tables from `prisma/schema.prisma` without generating migration files.

### Option B: Generate Migrations

```bash
npx prisma migrate dev --name init
```

This generates a migration file and applies it.

## 4. Seed

```bash
npm run db:seed
```

Creates:

| Data | Details |
|---|---|
| **Admin user** | `admin@cloudpos.com` / `admin123` (role: ADMIN) |
| **Cashier user** | `cashier@cloudpos.com` / `admin123` (role: CASHIER) |
| **Products** | Coffee, Sandwich, Chips, Soda, Water |
| **Categories** | Beverages, Food, Snacks |
| **Tags** | Hot, Cold, Fresh, Spicy |
| **Printer settings** | Default entry created on first app use |

## 5. Run

```bash
npm run dev
```

Open http://localhost:3000 — login with the seeded credentials above.

## Docker

Alternatively, run everything via Docker Compose:

```bash
docker compose up --build
```

This starts both a PostgreSQL 16 container and the app. The app uses Prisma's built-in migration mechanism on startup (not auto-configured — you must still run migrations manually after containers are up).

The Docker Compose defaults:

```
DATABASE_URL=postgresql://cloudpos:cloudpos_password@postgres:5432/cloudpos?schema=public
```

After `docker compose up -d`:

```bash
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

## Schema

The database consists of 7 models:

- **User** — login credentials with role (ADMIN / CASHIER)
- **Product** — inventory items with SKU, pricing, stock
- **Category** — product groupings (e.g. Beverages)
- **Tag** — labels linked to categories and products
- **Sale** — transaction header with payment info
- **SaleItem** — individual line items per sale
- **PrinterSettings** — thermal printer config for receipts

## Build for Production

```bash
npm run build
```

The app runs in standalone output mode (`next.config.ts`), producing a self-contained build in `.next/standalone/`.
