export function serializeTransaction<T extends { amount: bigint; sortOrder: bigint }>(
  tx: T
): Omit<T, "amount" | "sortOrder"> & { amount: string; sortOrder: string } {
  return { ...tx, amount: tx.amount.toString(), sortOrder: tx.sortOrder.toString() };
}
