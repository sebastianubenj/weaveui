import { useState, type ReactNode } from "react";
import { AddressesContext, type Address } from "./addresses-context";

const initialAddresses: Address[] = [
  { id: "home", name: "Home", first: "John", last: "Doe", street: "123 Main Street", line2: "Apt 4B", city: "New York", state: "NY", zip: "10001" },
  { id: "work", name: "Work", first: "John", last: "Doe", street: "456 Main Street", line2: "Apt 8C", city: "New York", state: "NY", zip: "10001" },
];

export function AddressesProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [defaultAddressId, setDefaultAddressId] = useState("home");
  function addAddress(address: Address, makeDefault: boolean) {
    setAddresses(current => [...current, address]);
    if (makeDefault) setDefaultAddressId(address.id);
  }
  function updateAddress(address: Address, makeDefault: boolean) {
    setAddresses(current => current.map(item => item.id === address.id ? address : item));
    if (makeDefault) setDefaultAddressId(address.id);
  }
  return <AddressesContext.Provider value={{ addresses, defaultAddressId, addAddress, updateAddress, setDefaultAddressId }}>{children}</AddressesContext.Provider>;
}
