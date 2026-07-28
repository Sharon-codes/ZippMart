# ProFlo Deployment Guide: proflotech.com

This guide provides step-by-step instructions to deploy the ProFlo Checkout System monorepo and map it to your GoDaddy domain **proflotech.com**.

## Architecture & Subdomain Mapping

To map the entire monorepo system under **proflotech.com**, we will use subdomains:

| Application | Target Host | URL | Root Directory |
|-------------|-------------|-----|----------------|
| **Customer Shop** | Vercel | `https://shop.proflotech.com` | `apps/customer-web` |
| **Admin HQ** | Vercel | `https://admin.proflotech.com` | `apps/admin-web` |
| **Cashier Counter** | Vercel | `https://counter.proflotech.com` | `apps/cashier-web` |
| **Express API** | Render / Railway | `https://api.proflotech.com` | `services/api` |

---

## Step 1: Deploying the Express API (Render Example)

The Express API is a long-running Node process that uses PostgreSQL (Supabase) for storage and handles cart sessions.

1. Go to [Render](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `proflo-api`
   - **Environment**: `Node`
   - **Root Directory**: `services/api`
   - **Build Command**: `cd ../.. && npm ci && npm run build -w @checkout/shared && npm run build -w api`
   - **Start Command**: `cd ../.. && npm run start -w api`
   - **Plan**: Starter (or higher - avoid free tier if you need persistent local uploads disk space)
4. Add the following **Environment Variables**:
   - `DATABASE_URL`: Your Supabase PostgreSQL pooler URL (e.g. `postgres://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`)
   - `JWT_SECRET`: A long random string for auth signatures.
   - `PUBLIC_API_URL`: `https://api.proflotech.com`
   - `CASHIER_API_KEY`: A secure key matching cashier terminal requests.
5. Save and deploy. Note down the default Render URL (e.g., `https://proflo-api.onrender.com`).

---

## Step 2: Deploying the Frontends on Vercel

You will create **three separate projects** on Vercel, all connected to the **same** GitHub repository.

### A. Customer Shop (`shop.proflotech.com`)
1. Create a new Vercel project, select the repository.
2. Configure settings:
   - **Project Name**: `proflo-customer`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/customer-web`
3. Expand **Build and Development Settings**:
   - **Build Command**: `npm run build -w customer-web`
   - **Install Command**: `npm install` (runs from monorepo root)
4. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://api.proflotech.com`
5. Enable **Include source files outside of the Root Directory** (Monorepo support) in settings if not automatically enabled.
6. Deploy.

### B. Admin HQ (`admin.proflotech.com`)
1. Create another Vercel project with the same repository.
2. Configure settings:
   - **Project Name**: `proflo-admin`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/admin-web`
3. Expand **Build and Development Settings**:
   - **Build Command**: `npm run build -w admin-web`
   - **Install Command**: `npm install`
4. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://api.proflotech.com`
5. Deploy.

### C. Cashier Counter (`counter.proflotech.com`)
1. Create a third Vercel project with the repository.
2. Configure settings:
   - **Project Name**: `proflo-cashier`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/cashier-web`
3. Expand **Build and Development Settings**:
   - **Build Command**: `npm run build -w cashier-web`
   - **Install Command**: `npm install`
4. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://api.proflotech.com`
   - `NEXT_PUBLIC_CASHIER_API_KEY`: (Must match `CASHIER_API_KEY` defined on the API backend)
5. Deploy.

---

## Step 3: GoDaddy DNS Configuration for proflotech.com

Since you have access to the domain portfolio on GoDaddy, configure the DNS records to point to Vercel and Render.

### 1. Point the Web Apps to Vercel
Go to **GoDaddy DNS Management** for `proflotech.com` and add `CNAME` records pointing your subdomains to Vercel's edge server (`cname.vercel-dns.com`):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `shop` | `cname.vercel-dns.com` | 1 Hour |
| CNAME | `admin` | `cname.vercel-dns.com` | 1 Hour |
| CNAME | `counter` | `cname.vercel-dns.com` | 1 Hour |

On Vercel, go to **Settings → Domains** for each of the projects and add the custom domains:
- For `proflo-customer` project: Add `shop.proflotech.com`
- For `proflo-admin` project: Add `admin.proflotech.com`
- For `proflo-cashier` project: Add `counter.proflotech.com`

Vercel will automatically verify the DNS records and issue SSL certificates.

### 2. Point the API Subdomain to Render
Add a `CNAME` record in GoDaddy pointing `api` to your Render Web Service domain:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `api` | `proflo-api.onrender.com` | 1 Hour |

On Render, go to your Web Service **Settings → Custom Domains** and add `api.proflotech.com`. Render will handle SSL routing automatically.

---

## Step 4: Stricter CORS Configuration (Recommended)

Currently, the Express API allows open requests. For production security under `proflotech.com`, restrict cross-origin requests.

In `services/api/src/index.ts`, replace general CORS with restricted origins:

```typescript
import cors from "cors";

const allowedOrigins = [
  "https://shop.proflotech.com",
  "https://admin.proflotech.com",
  "https://counter.proflotech.com"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS policy"));
    }
  },
  credentials: true
}));
```

---

## Alternative: Deploying via Hugging Face Space (All-in-One Docker)

If you have already deployed the monorepo to a **Hugging Face Space** using the included root `Dockerfile` and `push.ps1` script (running Nginx, Node API, and Next.js static frontends all in a single container), you can map your GoDaddy domain `proflotech.com` (or a subdomain) directly to that space!

### 1. Configure the Custom Domain in Hugging Face
1. Go to your **Hugging Face Space** page.
2. Click on **Settings** (gear icon near top-right).
3. Scroll down to the **Custom Domain** section.
4. Add the domain/subdomain you want to use (e.g. `shop.proflotech.com` or `proflotech.com`).
5. Hugging Face will generate a set of target records. Typically:
   - For subdomains (e.g. `shop.proflotech.com`), it will instruct you to add a **CNAME** record pointing to your space's direct URL:
     `CNAME` -> `<username>-<space-name>.hf.space`

### 2. Update GoDaddy DNS Records
Go to your **GoDaddy DNS Management** console for `proflotech.com` and add the record generated by Hugging Face:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `shop` | `adi576-proflo.hf.space` (or your actual space direct URL) | 1 Hour |

### 3. Accessing the System
Once DNS propagates, navigating to `https://shop.proflotech.com` will hit the Nginx router inside your Hugging Face Space:
- `https://shop.proflotech.com/` -> Customer Shop
- `https://shop.proflotech.com/admin` -> Admin HQ
- `https://shop.proflotech.com/cashier` -> Cashier Counter
- `https://shop.proflotech.com/checkout-api` -> Backend API endpoints

