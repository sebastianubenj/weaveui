import { useState, type ReactNode } from "react";
import { PaymentMethodsContext, type PaymentCard } from "./payment-methods-context";

const initialCards: PaymentCard[] = [
  { id: "visa", brand: "Visa", last4: "4242", type: "visa", billingAddress: { street: "456 Main Street", line2: "Apt 8C", city: "New York", state: "NY", zip: "10001" } },
  { id: "mastercard", brand: "Mastercard", last4: "3737", type: "mastercard", billingAddress: { street: "123 Main Street", line2: "Apt 4B", city: "New York", state: "NY", zip: "10001" } },
];
export function PaymentMethodsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ cards: PaymentCard[]; defaultCardId: string | null }>({ cards: initialCards, defaultCardId: "visa" });
  function addCard(card: PaymentCard, makeDefault: boolean) {
    setState(current => ({ cards: [...current.cards, card], defaultCardId: makeDefault || !current.defaultCardId ? card.id : current.defaultCardId }));
  }
  function setDefaultCardId(id: string) { setState(current => current.cards.some(card => card.id === id) ? { ...current, defaultCardId: id } : current); }
  function updateBillingAddress(id: string, billingAddress: PaymentCard["billingAddress"]) {
    setState(current => ({ ...current, cards: current.cards.map(card => card.id === id ? { ...card, billingAddress } : card) }));
  }
  return <PaymentMethodsContext.Provider value={{ ...state, addCard, setDefaultCardId, updateBillingAddress }}>{children}</PaymentMethodsContext.Provider>;
}
