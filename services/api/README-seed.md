Seeding catalog and orders
=================================

This document explains how to run the seed script that populates ~50-60 apparel products and simulates ~1 month of orders for the BLR001 store.

Prerequisites
- Ensure you have the API's dependencies installed in `services/api`:

```bash
cd services/api
npm install
```

- Provide a Postgres connection string via `DATABASE_URL` (Supabase or local Postgres). Example in `services/api/.env`:

```
DATABASE_URL=postgres://user:password@localhost:5432/dbname
DEFAULT_STORE_CODE=BLR001
```

 Optional
 - If you want to upload images to Supabase Storage instead of using external URLs, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
 - Optional: `DEFAULT_STORE_CODE` (defaults to `BLR001`).
 - If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (service role key) are set, the seed script will download product images and upload them to your Supabase `product-images` bucket and store the public URLs in the DB. This makes images self-hosted and avoids external hotlinking.

Run the seed

```bash
cd services/api
npm run seed:catalog
```

Or from the repo root:

```bash
npm run seed:catalog
```

What the script does
- Creates ~60 product rows across `Apparel`, `Outerwear`, and `Accessories` categories using realistic-sounding brand/style names.
- Assigns sizes, colors, prices, cost prices, tax, initial stock and demand scores.
- Uses `https://source.unsplash.com/featured/?<query>` image URLs to pull realistic clothing images when the dashboard loads.
- Inserts 200–350 orders distributed across the last 30 days to give the admin dashboard realistic month-of-sales KPIs.

Notes
- The script uses the API's `createProduct` and order helpers so stock movements and order records are consistent with the rest of the system.
- Running the script multiple times may create duplicate products/orders. Consider running in a fresh DB or wipe products/orders first.
