# Old Money

A fast, calm personal money tracker. Built around one behaviour: opening it
to log an expense in a few seconds. Everything else — income, categories,
monthly balance, lifetime totals, reports — sits one tap away.

No accounts, no login — this is a single-user dashboard.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://prisma.io) + SQLite (file-based, persistent, zero external
  services to run locally)
- [next-themes](https://github.com/pacocoursey/next-themes) for the
  dark-first/light theme toggle

## Getting started

```bash
npm install          # also generates the Prisma client (postinstall)
npm run db:migrate    # create/update the local SQLite database
npm run db:seed       # seed default categories (Food, Transport, Salary, ...)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it lands straight on
the Add screen.

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
