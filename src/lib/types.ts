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
  paymentMethod: string | null;
  occurredAt: string;
  createdAt: string;
  sortOrder: string;
  categoryId: string;
  category: Category;
};

export type CategoryTotal = { category: Category; total: string };

export type BalanceResponse = {
  month: string;
  monthly: { income: string; expenses: string; remaining: string };
  lifetime: { income: string; expenses: string; net: string };
  averageDailySpend: {
    current: string;
    previous: string;
    changePct: number | null;
    expenseGap: string;
    previousMonthExpenses: string;
  };
  categoryBreakdown: CategoryTotal[];
  dailyExpenses: { date: string; total: string }[];
  topExpenses: Transaction[];
};

export type ReportResponse = {
  total: string;
  transactions: Transaction[];
  breakdown: CategoryTotal[];
};

export type ForecastResponse = {
  currentBalance: string;
  avgMonthlyIncome: string;
  avgMonthlyExpenses: string;
  avgMonthlySavings: string;
  monthsOfData: number;
};
