/** The largest loss a user can pay is the coin they currently have. */
export function affordableBalanceChange(
  balance: number,
  coin: number,
  requestedChange: number,
): number | null {
  if (balance < coin) {
    return null;
  }

  return Math.max(requestedChange, -balance);
}
