import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const EXPENSE_CATEGORIES = [
  { name: "Food", color: "#f59e0b" },
  { name: "Transport", color: "#3b82f6" },
  { name: "Bills", color: "#ef4444" },
  { name: "Shopping", color: "#a855f7" },
  { name: "Health", color: "#14b8a6" },
];

const INCOME_CATEGORIES = [
  { name: "Salary", color: "#22c55e" },
  { name: "Freelance", color: "#0ea5e9" },
  { name: "Other", color: "#84cc16" },
];

async function main() {
  for (const c of EXPENSE_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: `seed-expense-${c.name.toLowerCase()}` },
      update: {},
      create: {
        id: `seed-expense-${c.name.toLowerCase()}`,
        name: c.name,
        color: c.color,
        type: "expense",
        isDefault: true,
      },
    });
  }

  for (const c of INCOME_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: `seed-income-${c.name.toLowerCase()}` },
      update: {},
      create: {
        id: `seed-income-${c.name.toLowerCase()}`,
        name: c.name,
        color: c.color,
        type: "income",
        isDefault: true,
      },
    });
  }

  // Uncategorised fallback categories, one per type, used when a category is deleted.
  await prisma.category.upsert({
    where: { id: "fallback-expense-uncategorised" },
    update: {},
    create: {
      id: "fallback-expense-uncategorised",
      name: "Uncategorised",
      color: "#6b7280",
      type: "expense",
      isDefault: true,
      isFallback: true,
    },
  });

  await prisma.category.upsert({
    where: { id: "fallback-income-uncategorised" },
    update: {},
    create: {
      id: "fallback-income-uncategorised",
      name: "Uncategorised",
      color: "#6b7280",
      type: "income",
      isDefault: true,
      isFallback: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
