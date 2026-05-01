# TipDrop 💸

**A production-ready Web3 social tipping platform built with Next.js, Circle SDK, and Arc Testnet.**

Send crypto tips to anyone — by username, GitHub, X, or wallet address. No signup required to tip.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + Framer Motion |
| UI | shadcn/ui (custom-built components) |
| Auth | NextAuth.js (email + wallet signature) |
| Database | PostgreSQL via Prisma ORM |
| Payments | Circle SDK (USDC) + Arc Testnet (nanopayments) |
| Deployment | Vercel + Supabase |

---

## Project Structure

```
tipdrop/
├── prisma/
│   ├── schema.prisma          # Full DB schema
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── not-found.tsx      # 404 page
│   │   ├── [username]/        # Public tip pages
│   │   ├── auth/
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Register page
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── transactions/  # Tx history
│   │   │   ├── analytics/     # Analytics
│   │   │   ├── links/         # Tip link manager
│   │   │   ├── profile/       # Profile editor
│   │   │   └── settings/      # Account settings
│   │   └── api/
│   │       ├── auth/          # NextAuth + register
│   │       ├── tips/          # Create + confirm tips
│   │       ├── links/         # CRUD tip links
│   │       ├── profile/       # Profile update
│   │       ├── settings/      # Settings update
│   │       ├── users/         # Public user lookup
│   │       ├── arc/           # Nanopayment settlement
│   │       └── webhooks/      # Circle webhooks
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, Sidebar
│   │   ├── ui/                # Button, Card, Input, etc.
│   │   ├── tip/               # TipForm, Dashboard, etc.
│   │   └── wallet/            # WalletConnectButton
│   ├── lib/
│   │   ├── arc/               # Arc testnet client
│   │   ├── circle/            # Circle SDK wrapper
│   │   ├── auth/              # NextAuth config
│   │   ├── prisma/            # Prisma singleton
│   │   └── utils/             # Helpers
│   ├── styles/
│   │   └── globals.css        # Design tokens + global CSS
│   └── types/
│       └── index.ts           # TypeScript types
├── .env.example               # Environment variables template
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Quick Start (Local Development)

### 1. Clone and install

```bash
git clone <your-repo>
cd tipdrop
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Fill in all values (see Environment Variables section below)
```

### 3. Set up database

```bash
# Option A: Local PostgreSQL
createdb tipdrop

# Option B: Supabase (recommended)
# Create project at supabase.com, copy DATABASE_URL

npx prisma generate
npx prisma db push
npm run db:seed   # Optional: load demo data
```

### 4. Run development server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<run: openssl rand -base64 32>

# Database (Supabase)
DATABASE_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres

# Circle SDK
# Get from: https://console.circle.com
CIRCLE_API_KEY=TEST_API_KEY:...
CIRCLE_WALLET_SET_ID=<from circle dashboard>
CIRCLE_ENTITY_SECRET=<hex secret for programmatic wallets>
NEXT_PUBLIC_CIRCLE_APP_ID=<circle app id>

# Arc Testnet
NEXT_PUBLIC_ARC_TESTNET_RPC=https://rpc.testnet.arc.fun
NEXT_PUBLIC_ARC_CHAIN_ID=1116
NEXT_PUBLIC_USDC_CONTRACT=<USDC contract on Arc testnet>
ARC_PRIVATE_KEY=<relayer wallet private key for server-side txs>

# WalletConnect (optional, for WalletConnect v2)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<from cloud.walletconnect.com>

# Cron secret (for Arc settlement endpoint)
CRON_SECRET=<openssl rand -base64 32>
```

---

## Deployment (Vercel + Supabase)

### Step 1: Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy the `DATABASE_URL` from Settings → Database
3. Enable Row Level Security if needed

### Step 2: Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Or via GitHub:
1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in Vercel dashboard

### Step 3: Run migrations on production DB

```bash
DATABASE_URL=<prod-url> npx prisma db push
DATABASE_URL=<prod-url> npm run db:seed
```

### Step 4: Set up cron job (nanopayment settlement)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/arc/settle",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

And add the `Authorization: Bearer <CRON_SECRET>` header in the cron config.

### Step 5: Configure Circle webhooks

1. Go to Circle Console → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/circle`
3. Subscribe to: `payments.payment_confirmed`, `payments.payment_failed`, `transfers.*`

---

## Circle SDK Setup

1. Create account at [console.circle.com](https://console.circle.com)
2. Generate API key (sandbox for testing)
3. Create a Wallet Set under Programmable Wallets
4. Generate Entity Secret:
   ```bash
   openssl rand -hex 32
   ```
5. Register the entity secret in Circle console
6. Copy wallet set ID to env

For sandbox testing, use Circle's test USDC faucet.

---

## Arc Testnet Setup

1. Add Arc Testnet to MetaMask:
   - Network name: Arc Testnet
   - RPC URL: `https://rpc.testnet.arc.fun`
   - Chain ID: `1116`
   - Currency symbol: `ARC`
   - Explorer: `https://explorer.testnet.arc.fun`

2. Get testnet ARC tokens from the Arc faucet

3. Deploy or use the existing USDC test token on Arc testnet

4. Fund your relayer wallet (`ARC_PRIVATE_KEY`) with ARC for gas

---

## Payment Flow

```
User enters amount
        ↓
Wallet connects (MetaMask / WalletConnect)
        ↓
Switch to Arc Testnet (auto-prompted)
        ↓
POST /api/tips/create
  → Creates PENDING tip record
  → Checks if both users have Circle wallets
        ↓
  If both have Circle wallets:
    → Server-side Circle transfer (instant)
    → Tip marked CONFIRMED
        ↓
  Else (external wallet):
    → Returns receiver's wallet address + USDC contract
    → Client signs ERC-20 transfer on Arc
    → POST /api/tips/:id/confirm with txHash
    → Verified on-chain via Arc RPC
    → Tip marked CONFIRMED
        ↓
Circle webhook (backup confirmation)
        ↓
Nanopayment batch settlement (cron):
  → Groups tips by receiver
  → Submits batch via Arc
  → Records batch in DB
```

---

## Testing

### Local testing checklist

```bash
# 1. Start dev server
npm run dev

# 2. Register account at /auth/register
# 3. View your tip page at /{username}
# 4. Connect MetaMask to Arc Testnet
# 5. Send a tip (uses test USDC)
# 6. Check dashboard at /dashboard
# 7. View transaction at /dashboard/transactions

# Run DB studio for data inspection
npm run db:studio
```

### API testing with curl

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","email":"test@example.com","password":"password123"}'

# Get user profile
curl http://localhost:3000/api/users/testuser

# Trigger nanopayment settlement (requires CRON_SECRET)
curl -X POST http://localhost:3000/api/arc/settle \
  -H "Authorization: Bearer <CRON_SECRET>"
```

---

## Key Features Summary

- ✅ Landing page with live tip demo widget
- ✅ Email + Wallet (MetaMask) authentication
- ✅ Public tip pages at `/{username}`
- ✅ Tip form with amount presets, token selector, message, anonymous mode
- ✅ Circle USDC payments (server-side Circle wallet transfers)
- ✅ Arc Testnet integration (on-chain USDC transfers)
- ✅ Nanopayment batch settlement via Arc
- ✅ Transaction history with status tracking
- ✅ 30-day analytics with charts
- ✅ Custom tip links with preset amounts
- ✅ QR code generator (downloadable PNG)
- ✅ Profile editor with social links
- ✅ Dark/light mode
- ✅ Mobile-first responsive design
- ✅ Circle webhook handler
- ✅ Full TypeScript + Prisma ORM
- ✅ Deployment guide (Vercel + Supabase)
