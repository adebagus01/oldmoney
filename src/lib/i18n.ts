export type Language = "en" | "id";

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "id", label: "Bahasa Indonesia" },
];

const dict = {
  nav: {
    appName: { en: "Old Money", id: "Old Money" },
    add: { en: "Add", id: "Tambah" },
    balance: { en: "Balance", id: "Saldo" },
    reports: { en: "Reports", id: "Laporan" },
    calculator: { en: "Calculator", id: "Kalkulator" },
    settings: { en: "Settings", id: "Pengaturan" },
  },
  common: {
    cancel: { en: "Cancel", id: "Batal" },
    edit: { en: "Edit", id: "Ubah" },
    delete: { en: "Delete", id: "Hapus" },
    undo: { en: "Undo", id: "Batalkan" },
    optional: { en: "(optional)", id: "(opsional)" },
    loading: { en: "Loading…", id: "Memuat…" },
    previousMonth: { en: "Previous month", id: "Bulan sebelumnya" },
    nextMonth: { en: "Next month", id: "Bulan berikutnya" },
  },
  add: {
    expense: { en: "Expense", id: "Pengeluaran" },
    income: { en: "Income", id: "Pemasukan" },
    note: { en: "Note", id: "Catatan" },
    notePlaceholderExpense: { en: "What did you buy? (optional)", id: "Beli apa? (opsional)" },
    notePlaceholderIncome: { en: "(optional)", id: "(opsional)" },
    category: { en: "Category", id: "Kategori" },
    paymentMethod: { en: "Payment method", id: "Metode pembayaran" },
    date: { en: "Date", id: "Tanggal" },
    saveExpense: { en: "Save expense", id: "Simpan pengeluaran" },
    saveIncome: { en: "Save income", id: "Simpan pemasukan" },
    saving: { en: "Saving…", id: "Menyimpan…" },
    recent: { en: "Recent", id: "Terbaru" },
    errorAmount: { en: "Enter an amount greater than zero.", id: "Masukkan jumlah lebih dari nol." },
    errorCategory: { en: "Pick a category.", id: "Pilih kategori." },
    expenseAdded: { en: "Expense added", id: "Pengeluaran ditambahkan" },
    incomeAdded: { en: "Income added", id: "Pemasukan ditambahkan" },
    changesSaved: { en: "Changes saved", id: "Perubahan disimpan" },
    noTransactionsYet: { en: "No transactions yet.", id: "Belum ada transaksi." },
  },
  balance: {
    title: { en: "Balance", id: "Saldo" },
    thisMonth: { en: "This month", id: "Bulan ini" },
    income: { en: "Income", id: "Pemasukan" },
    expenses: { en: "Expenses", id: "Pengeluaran" },
    remaining: { en: "Remaining", id: "Sisa" },
    averageDailySpend: { en: "Average daily spend", id: "Rata-rata pengeluaran harian" },
    vsLastMonth: { en: "vs last month", id: "vs bulan lalu" },
    dailySpending: { en: "Daily spending", id: "Pengeluaran harian" },
    spendingByCategory: { en: "Spending by category", id: "Pengeluaran per kategori" },
    noDaysInRange: { en: "No days in range yet.", id: "Belum ada data untuk rentang ini." },
    emptyState: {
      en: "No transactions yet — add your first expense or income to see your numbers here.",
      id: "Belum ada transaksi — tambahkan pengeluaran atau pemasukan pertamamu untuk melihat angkanya di sini.",
    },
    allTime: { en: "All time", id: "Sepanjang waktu" },
    accumulatedSince: { en: "Accumulated since the beginning", id: "Terkumpul sejak awal" },
    hide: { en: "Hide", id: "Sembunyikan" },
    show: { en: "Show", id: "Tampilkan" },
    netBalanceAllTime: { en: "Net balance · all time", id: "Saldo bersih · sepanjang waktu" },
    keptPercent: {
      en: "You've kept {pct}% of everything you've earned",
      id: "Kamu menyimpan {pct}% dari semua yang kamu hasilkan",
    },
    noIncomeYet: { en: "No income recorded yet", id: "Belum ada pemasukan tercatat" },
    topExpenses: { en: "Top 5 spent this month", id: "5 Pengeluaran Terbesar Bulan Ini" },
    noTopExpenses: { en: "No expenses this month yet.", id: "Belum ada pengeluaran bulan ini." },
  },
  reports: {
    title: { en: "Reports", id: "Laporan" },
    allCategories: { en: "All categories", id: "Semua kategori" },
    sortNewest: { en: "Newest first", id: "Terbaru dulu" },
    sortOldest: { en: "Oldest first", id: "Terlama dulu" },
    sortHighest: { en: "Highest amount", id: "Jumlah tertinggi" },
    sortLowest: { en: "Lowest amount", id: "Jumlah terendah" },
    sortCustom: { en: "Custom order", id: "Urutan kustom" },
    dragHint: { en: "Drag to reorder", id: "Seret untuk mengurutkan" },
    totalSpent: { en: "Total spent", id: "Total pengeluaran" },
    totalEarned: { en: "Total earned", id: "Total pemasukan" },
    byCategory: { en: "By category", id: "Per kategori" },
    noBreakdownYet: { en: "Nothing to break down yet.", id: "Belum ada yang bisa dirinci." },
    transactions: { en: "Transactions", id: "Transaksi" },
    noExpensesThisMonth: { en: "No expenses this month.", id: "Belum ada pengeluaran bulan ini." },
    noIncomeThisMonth: { en: "No income this month.", id: "Belum ada pemasukan bulan ini." },
    reorderFailed: { en: "Couldn't save the new order.", id: "Gagal menyimpan urutan baru." },
  },
  calculator: {
    title: { en: "Calculator", id: "Kalkulator" },
    forecastTitle: { en: "Forecast", id: "Perkiraan" },
    forecastSubtitle: {
      en: "Based on your real income and expenses",
      id: "Berdasarkan pemasukan dan pengeluaran nyatamu",
    },
    currentBalance: { en: "Current balance", id: "Saldo saat ini" },
    avgMonthlyIncome: { en: "Avg. monthly income", id: "Rata-rata pemasukan bulanan" },
    avgMonthlyExpenses: { en: "Avg. monthly expenses", id: "Rata-rata pengeluaran bulanan" },
    avgMonthlySavings: { en: "Avg. monthly savings", id: "Rata-rata tabungan bulanan" },
    basedOnMonths: {
      en: "Based on {count} month(s) of data",
      id: "Berdasarkan {count} bulan data",
    },
    goalAmount: { en: "Goal amount", id: "Jumlah target" },
    notEnoughData: {
      en: "Not enough transaction history yet to forecast. Add a few expenses and income entries first.",
      id: "Belum cukup riwayat transaksi untuk membuat perkiraan. Tambahkan beberapa transaksi terlebih dahulu.",
    },
    alreadyReached: { en: "You've already reached this goal!", id: "Kamu sudah mencapai target ini!" },
    cannotReach: {
      en: "At your current rate, you're not saving enough to reach this goal.",
      id: "Dengan laju saat ini, tabunganmu tidak cukup untuk mencapai target ini.",
    },
    monthsToGo: { en: "{count} months to go", id: "{count} bulan lagi" },
    estimatedDate: { en: "Estimated around {date}", id: "Diperkirakan sekitar {date}" },
    enterGoal: { en: "Enter a goal amount to see your forecast.", id: "Masukkan jumlah target untuk melihat perkiraan." },
    manualTitle: { en: "Manual calculator", id: "Kalkulator manual" },
    manualSubtitle: { en: "Try your own numbers", id: "Coba angka milikmu sendiri" },
    startingBalance: { en: "Starting balance", id: "Saldo awal" },
    monthlyIncome: { en: "Monthly income", id: "Pemasukan bulanan" },
    monthlyExpenses: { en: "Monthly expenses", id: "Pengeluaran bulanan" },
    monthlySavings: { en: "Monthly savings", id: "Tabungan bulanan" },
  },
  settings: {
    title: { en: "Settings", id: "Pengaturan" },
    preferences: { en: "Preferences", id: "Preferensi" },
    theme: { en: "Theme", id: "Tema" },
    themeSubtitle: { en: "Dark by default, switch anytime.", id: "Gelap secara default, ubah kapan saja." },
    dark: { en: "Dark", id: "Gelap" },
    light: { en: "Light", id: "Terang" },
    language: { en: "Language", id: "Bahasa" },
    languageSubtitle: { en: "Applies across the whole app.", id: "Berlaku di seluruh aplikasi." },
    currency: { en: "Currency", id: "Mata Uang" },
    currencySubtitle: {
      en: "Display only — amounts are always entered and stored in Rupiah.",
      id: "Hanya tampilan — jumlah selalu dimasukkan dan disimpan dalam Rupiah.",
    },
    currencyNote: {
      en: "Showing everything converted to {code} at an approximate, fixed rate — not a live exchange rate. Switch back to IDR anytime to see the exact original Rupiah amounts.",
      id: "Semua ditampilkan dalam konversi {code} dengan kurs tetap perkiraan — bukan kurs langsung. Kembali ke IDR kapan saja untuk melihat jumlah Rupiah asli.",
    },
    exportData: { en: "Export data", id: "Ekspor data" },
    exportSubtitle: { en: "Download every transaction you've logged.", id: "Unduh semua transaksi yang sudah kamu catat." },
    expenseCategories: { en: "Expense categories", id: "Kategori pengeluaran" },
    incomeCategories: { en: "Income categories", id: "Kategori pemasukan" },
    newExpenseCategory: { en: "New expense category", id: "Kategori pengeluaran baru" },
    newIncomeCategory: { en: "New income category", id: "Kategori pemasukan baru" },
    fallback: { en: "(fallback)", id: "(cadangan)" },
    add: { en: "Add", id: "Tambah" },
    deleteConfirm: {
      en: "Delete this category? Its transactions will move to Uncategorised.",
      id: "Hapus kategori ini? Transaksinya akan dipindahkan ke Tanpa Kategori.",
    },
    deleteFailed: { en: "Failed to delete", id: "Gagal menghapus" },
    addFailed: { en: "Failed to add category", id: "Gagal menambah kategori" },
  },
  transaction: {
    editExpense: { en: "Edit expense", id: "Ubah pengeluaran" },
    editIncome: { en: "Edit income", id: "Ubah pemasukan" },
    saveChanges: { en: "Save changes", id: "Simpan perubahan" },
    close: { en: "Close", id: "Tutup" },
    deletedPrefix: { en: "Deleted", id: "Dihapus" },
    transactionActions: { en: "Transaction actions", id: "Aksi transaksi" },
  },
  paymentMethods: {
    Cash: { en: "Cash", id: "Tunai" },
    "Debit Card": { en: "Debit Card", id: "Kartu Debit" },
    "E-Wallet": { en: "E-Wallet", id: "E-Wallet" },
    "Bank Transfer": { en: "Bank Transfer", id: "Transfer Bank" },
  },
} as const;

type Dict = typeof dict;
type Section = keyof Dict;

export type TranslationKey = {
  [S in Section]: `${S}.${Extract<keyof Dict[S], string>}`;
}[Section];

export function translate(key: TranslationKey, language: Language): string {
  const [section, sub] = key.split(".") as [Section, string];
  const entry = (dict[section] as Record<string, Record<Language, string>>)[sub];
  return entry ? entry[language] : key;
}

export function translatePaymentMethod(method: string, language: Language): string {
  const entry = (dict.paymentMethods as Record<string, Record<Language, string>>)[method];
  return entry ? entry[language] : method;
}

const LOCALES: Record<Language, string> = { en: "en-US", id: "id-ID" };

export function localeFor(language: Language): string {
  return LOCALES[language];
}
