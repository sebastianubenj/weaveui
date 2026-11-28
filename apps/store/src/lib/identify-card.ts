import creditCardType from "credit-card-type";
import type { CreditCardType } from "credit-card-type/dist/types";

export function identifyCard(digits: string): CreditCardType | null {
  if (!digits) return null;
  const matches = creditCardType(digits);
  return matches.length === 1 ? matches[0] : null;
}
