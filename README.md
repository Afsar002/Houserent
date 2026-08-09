# 🏠 Rent Receipt Generator & Property Manager

A full-stack Next.js (App Router) application for generating rent receipts, managing properties, owners, managers, and maintaining a tenant ledger — with server-side PostgreSQL persistence via Prisma ORM.

## ✨ Features

- **3-Tab Workflow**: Receipt Controls → Receipt Generation → Templates & Data Editor
- **Server-Side Persistence**: All data (properties, owners, managers, receipts) stored in PostgreSQL
- **PDF Generation**: Client-side A4 PDF export via `html2pdf.js`
- **Auto Receipt Numbering**: Sequences automatically starting from `0001`
- **Number to Words**: Real-time conversion of amounts into written currency terms
- **Previous Bill Auto-Fetch**: Automatically loads previous meter reading and balance due
- **Receipt Lookup**: Fetch any previous receipt by number
- **Seal & Signature Upload**: Attach images directly onto receipts
- **Full CRUD**: Owners, Managers, Properties, Units, and Receipts

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 14+ (App Router)            |
| Styling    | Tailwind CSS                        |
| ORM        | Prisma                              |
| Database   | PostgreSQL (Vercel Postgres / Supabase) |
| PDF        | html2pdf.js (client-side)           |
| Icons      | lucide-react                        |

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── receipts/       # GET (list/fetch by no), POST (create)
│   │   ├── properties/     # GET, POST, PUT, DELETE
│   │   ├── owners/         # GET, POST, PUT, DELETE
│   │   └── managers/       # GET, POST, PUT, DELETE
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main client component (3-tab UI)
│   └── globals.css         # Tailwind + print styles
├── components/
│   ├── ReceiptControls.tsx     # Step 1: Form inputs
│   ├── ReceiptGeneration.tsx   # Step 2: Preview + actions
│   ├── ReceiptPreview.tsx      # PDF-renderable receipt layout
│   └── SettingsEditor.tsx      # Tab 3: Data editor
├── lib/
│   ├── api.ts              # Fetch wrapper for all API endpoints
│   ├── prisma.ts           # Prisma client singleton
│   ├── types.ts            # Shared TypeScript interfaces
│   └── utils.ts            # numberToWords, compressImage, date helpers
├── prisma/
│   └── schema.prisma       # Database models
├── types/
│   └── html2pdf.d.ts       # Type declaration for html2pdf.js
├── vercel.json             # Vercel deployment config
└── package.json
```

## 🗄️ Database Models

- **Owner**: id, name, address, phone
- **Manager**: id, name, address, phone
- **Property**: id, name, ownerId, sealUrl
- **Unit**: id, propertyId, floor, unit, tenantName, tenantPhone, rent, water, tax, prevBalance
- **Receipt**: id, receiptNo, date, propertyName, ownerName, floor, unit, tenantName, tenantPhone, periodStart, periodEnd, paymentMode, rentMaint, waterCharges, rentalTax, prevUnit, currUnit, elecRate, elecTotalAmount, totalAmountToBeReceived, amountReceived, dueAmount, isFullPaid, receivedBy, createdAt

## 🔌 API Endpoints

| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/api/receipts`       | List all receipts (or `?receiptNo=0005`) |
| POST   | `/api/receipts`       | Create a new receipt                     |
| GET    | `/api/properties`     | List all properties with units & owner   |
| POST   | `/api/properties`     | Create a property (with optional units)  |
| PUT    | `/api/properties?id=` | Update property + replace units          |
| DELETE | `/api/properties?id=` | Delete property (cascades to units)      |
| GET    | `/api/owners`         | List all owners                          |
| POST   | `/api/owners`         | Create an owner                          |
| PUT    | `/api/owners?id=`     | Update an owner                          |
| DELETE | `/api/owners?id=`     | Delete an owner                          |
| GET    | `/api/managers`       | List all managers                        |
| POST   | `/api/managers`       | Create a manager                         |
| PUT    | `/api/managers?id=`   | Update a manager                         |
| DELETE | `/api/managers?id=`   | Delete a manager                         |

## 🛠️ Local Development

### Prerequisites

- Node.js 18.17+ or 20+
- PostgreSQL database (local, Docker, or cloud)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with your database URL
echo "DATABASE_URL=\"postgresql://USER:PASSWORD@localhost:5432/rent_receipts?schema=public\"" > .env

# 3. Push the Prisma schema to your database
npm run db:push

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ☁️ Deploying to Vercel

### 1. Create a PostgreSQL Database

**Option A — Vercel Postgres (Neon):**

1. Go to your Vercel project → **Storage** tab
2. Click **Create Database** → select **Neon** (Vercel Postgres)
3. Follow the prompts to connect it to your project

**Option B — Supabase:**

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database → Connection string**
3. Copy the connection string (use the "Transaction" pooler URL for serverless)

### 2. Set Environment Variables on Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Name          | Value                                                        |
|---------------|--------------------------------------------------------------|
| `DATABASE_URL` | Your PostgreSQL connection string (e.g. `postgresql://...`) |

> ⚠️ **Important**: For serverless deployments, use the **pooled/transaction** connection string (e.g. Neon's `-pooler` URL or Supabase's `:6543` port) to avoid connection limits.

### 3. Deploy

```bash
# Push schema to production database
npx prisma db push

# Deploy to Vercel
vercel --prod
```

Or connect your GitHub repository to Vercel and it will auto-deploy on every push.

## 📄 License

MIT