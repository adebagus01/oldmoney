export type TransactionType = "expense" | "income";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  isDefault: boolean;
  isFallback: boolean;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: string;
  note: string | null;
  occurredAt: string;
  createdAt: string;
  categoryId: string;
  category: Category;
};

export type BalanceResponse = {
  month: string;
  monthly: { income: string; expenses: string; remaining: string };
  lifetime: { income: string; expenses: string; net: string };
};

export type ReportResponse = {
  total: string;
  transactions: Transaction[];
  breakdown: { category: Category; total: string }[];
};
