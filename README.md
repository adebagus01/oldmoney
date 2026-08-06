# Old Money

A fast, calm personal money tracker. Built around one behaviour: opening it
to log an expense in a few seconds. Everything else — income, categories,
monthly balance, lifetime totals, reports — sits one tap away.

No accounts, no login — this is a single-user dashboard.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://prisma.io) + Postgres, via the `pg` driver adapter — works
  against any Postgres (local, Neon, Vercel Postgres, Supabase, ...)
- [next-themes](https://github.com/pacocoursey/next-themes) for the
  dark-first/light theme toggle

## Getting started

You need a Postgres database to point at. Fastest local option is Docker:

```bash
docker run -d --name oldmoney-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
```

Then:

```bash
cp .env.example .env   # already points at the Docker instance above by default
npm install             # also generates the Prisma client (postinstall)
npm run db:migrate      # create/update the database schema
npm run db:seed         # seed default categories (Food, Transport, Salary, ...)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it lands straight on
the Add screen.

## Deploying to Vercel

1. **Provision a Postgres database.** In the Vercel dashboard, open your
   project → **Storage** → **Create Database**, and pick a Postgres option
   (Neon is Vercel's built-in one). This gives you a `DATABASE_URL` and
   wires it into your project's environment variables automatically — or
   use any other Postgres provider and set `DATABASE_URL` yourself under
   **Settings → Environment Variables**.
2. **Import the repo.** Vercel dashboard → **Add New… → Project** → import
   `adebagus01/oldmoney`. It auto-detects Next.js; no config needed.
3. **Deploy.** The build runs `vercel-build` (`prisma migrate deploy && next
   build`), so your schema is applied automatically on every deploy —
   no separate migration step to remember.
4. First deploy will land with an empty database. Seed it once, from your
   machine, pointed at the production `DATABASE_URL`:
   ```bash
   DATABASE_URL="<value from Vercel>" npm run db:seed
   ```

From then on, every push to the deployed branch redeploys and migrates
automatically.

## Data model

Two tables carry the whole app (`prisma/schema.prisma`):

- **`Transaction`** — `type` (expense/income), `amount` (integer, smallest
  currency unit — never a float), `categoryId`, `note`, `occurredAt`.
- **`Category`** — `name`, `type`, `color`, plus `isDefault`/`isFallback`
  flags. Two independent sets (expense/income). Deleting a category
  reassigns its transactions to that type's "Uncategorised" fallback rather
  than deleting them.

Monthly and lifetime figures are just queries with/without a date filter
over the same permanent data — nothing is ever reset or deleted at month
boundaries.

## Screens

- **Add** (`/`, default route) — amount-first entry, expense/income toggle,
  one-tap category chips, recent entries list.
- **Balance** (`/balance`) — month switcher with monthly income/expenses/
  remaining, plus an always-on lifetime income + net block.
- **Reports** (`/reports`) — filter expenses by category/date range, see a
  running total, a per-category breakdown, and a sortable transaction list.
- **Settings** (`/settings`) — manage categories, theme, currency display,
  and CSV/JSON data export.
