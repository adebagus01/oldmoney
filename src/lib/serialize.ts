export function serializeTransaction<T extends { amount: bigint }>(
  tx: T
): Omit<T, "amount"> & { amount: string } {
  return { ...tx, amount: tx.amount.toString() };
}
