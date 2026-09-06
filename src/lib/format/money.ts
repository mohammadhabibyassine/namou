import Decimal from "decimal.js";

export function formatMoney(
  amount: string,
  currencyCode: string,
  locale?: string,
): string {
  const numericAmount = new Decimal(amount).toNumber();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(numericAmount);
}

export function multiplyMoney(amount: string, quantity: number): string {
  return new Decimal(amount).times(quantity).toFixed(2);
}

export function sumMoney(amounts: readonly string[]): string {
  return amounts
    .reduce((total, amount) => total.plus(amount), new Decimal(0))
    .toFixed(2);
}
