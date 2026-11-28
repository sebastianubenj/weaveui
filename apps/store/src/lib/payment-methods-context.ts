import { createContext, useContext } from "react";
import type { Address } from "./addresses-context";

export type BillingAddress = Pick<Address, "street" | "line2" | "city" | "state" | "zip">;
export type PaymentCard = { id: string; brand: string; last4: string; type?: string; billingAddress: BillingAddress };
export interface PaymentMethodsState {
  cards: PaymentCard[];
  defaultCardId: string | null;
  addCard: (card: PaymentCard, makeDefault: boolean) => void;
  setDefaultCardId: (id: string) => void;
  updateBillingAddress: (id: string, address: BillingAddress) => void;
}
export const PaymentMethodsContext = createContext<PaymentMethodsState | null>(null);
export function usePaymentMethods() {
  const context = useContext(PaymentMethodsContext);
  if (!context) throw new Error("usePaymentMethods requires PaymentMethodsProvider");
  return context;
}
