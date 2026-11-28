import { useState, type ReactNode } from "react";
import { AddressesContext, type Address } from "./addresses-context";

const initialAddresses: Address[] = [
  { id: "home", name: "Home", first: "John", last: "Doe", street: "123 Main Street", line2: "Apt 4B", city: "New York", state: "NY", zip: "10001" },
  { id: "work", name: "Work", first: "John", last: "Doe", street: "456 Main Street", line2: "Apt 8C", city: "New York", state: "NY", zip: "10001" },
];

export function AddressesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ addresses: Address[]; defaultAddressId: string | null }>({ addresses: initialAddresses, defaultAddressId: "home" });
  const { addresses, defaultAddressId } = state;
  function setDefaultAddressId(id: string) { setState(current => ({ ...current, defaultAddressId: id })); }
  function addAddress(address: Address, makeDefault: boolean) {
    setState(current => ({ addresses: [...current.addresses, address], defaultAddressId: makeDefault || !current.defaultAddressId ? address.id : current.defaultAddressId }));
  }
  function updateAddress(address: Address, makeDefault: boolean) {
    setState(current => ({ addresses: current.addresses.map(item => item.id === address.id ? address : item), defaultAddressId: makeDefault ? address.id : current.defaultAddressId }));
  }
  function deleteAddress(id: string, replacementId?: string) {
    setState(current => {
      const remaining = current.addresses.filter(item => item.id !== id);
      if (current.defaultAddressId === id && remaining.length > 1 && !remaining.some(item => item.id === replacementId)) return current;
      return { addresses: remaining, defaultAddressId: current.defaultAddressId === id ? (remaining.find(item => item.id === replacementId)?.id ?? remaining[0]?.id ?? null) : current.defaultAddressId };
    });
  }
  return <AddressesContext.Provider value={{ addresses, defaultAddressId, addAddress, updateAddress, deleteAddress, setDefaultAddressId }}>{children}</AddressesContext.Provider>;
}
