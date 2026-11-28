import { createContext, useContext } from "react";

export interface Address {
  id: string;
  name: string;
  first: string;
  last: string;
  street: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}

export interface AddressesState {
  addresses: Address[];
  defaultAddressId: string | null;
  addAddress: (address: Address, makeDefault: boolean) => void;
  deleteAddress: (id: string, replacementId?: string) => void;
  updateAddress: (address: Address, makeDefault: boolean) => void;
  setDefaultAddressId: (id: string) => void;
}

export const AddressesContext = createContext<AddressesState | null>(null);

export function useAddresses() {
  const context = useContext(AddressesContext);
  if (!context) throw new Error("useAddresses requires AddressesProvider");
  return context;
}
