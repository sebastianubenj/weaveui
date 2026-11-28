import type { ChangeEvent } from "react";
import { Field, Input, Select, SelectContent, SelectItem } from "@weaveui/ds";
import type { Address } from "@/lib/addresses-context";

const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

function formatZip(event: ChangeEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const digits = input.value.replace(/\D/g, "").slice(0, 9);
  const digitsBeforeCaret = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, "").length;
  input.value = digits.replace(/^(\d{5})(?=\d)/, "$1-");
  let position = 0;
  let count = 0;
  while (position < input.value.length && count < digitsBeforeCaret) {
    if (/\d/.test(input.value[position])) count++;
    position++;
  }
  input.setSelectionRange(position, position);
}

function AddressInput({ id, label, placeholder, autoComplete, optional, zip, defaultValue }: { id: string; label: string; placeholder: string; autoComplete?: string; optional?: boolean; zip?: boolean; defaultValue?: string }) {
  return <Field label={label} htmlFor={id} optional={optional}><Input id={id} name={id} defaultValue={defaultValue} placeholder={placeholder} autoComplete={autoComplete} required={!optional} inputMode={zip ? "numeric" : undefined} pattern={zip ? "[0-9]{5}(-[0-9]{4})?" : undefined} title={zip ? "Enter a 5-digit ZIP code or ZIP+4." : undefined} onChange={zip ? formatZip : undefined} /></Field>;
}

export function AddressFields({ prefix, values, contact = false, firstId, lastId }: { prefix: string; values?: Pick<Address, "street" | "line2" | "city" | "state" | "zip"> & Partial<Pick<Address, "first" | "last" | "name">>; contact?: boolean; firstId?: string; lastId?: string }) {
  return <>
    {contact && <><AddressInput id={firstId ?? `${prefix}-first`} label="First name" placeholder="Enter your first name" autoComplete="given-name" defaultValue={values?.first} /><AddressInput id={lastId ?? `${prefix}-last`} label="Last name" placeholder="Enter your last name" autoComplete="family-name" defaultValue={values?.last} /></>}
    <AddressInput id={`${prefix}-street`} label="Street address" placeholder="Enter your street address" autoComplete="address-line1" defaultValue={values?.street} />
    <AddressInput id={`${prefix}-line2`} label="Address line 2" placeholder="e.g. Apt 4B" autoComplete="address-line2" optional defaultValue={values?.line2} />
    <AddressInput id={`${prefix}-city`} label="City" placeholder="Enter your city" autoComplete="address-level2" defaultValue={values?.city} />
    <Field label="State" htmlFor={`${prefix}-state`}><Select id={`${prefix}-state`} name={`${prefix}-state`} defaultValue={values?.state} placeholder="Select an option" required><SelectContent>{states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select></Field>
    <AddressInput id={`${prefix}-zip`} label="ZIP code" placeholder="Enter your ZIP code" autoComplete="postal-code" zip defaultValue={values?.zip} />
    {contact && <AddressInput id={`${prefix}-name`} label="Address name" placeholder="e.g. Home, Work" defaultValue={values?.name} />}
  </>;
}
