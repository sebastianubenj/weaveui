import { useState, type ChangeEvent, type FormEvent } from "react";
import creditCardType from "credit-card-type";
import type { CreditCardType } from "credit-card-type/dist/types";
import { Button, Checkbox, Field, Icon, Input, RadioToggle, Select, SelectContent, SelectItem, iconBox16 } from "@weaveui/ds";
import { useBagEntries } from "@/lib/bag";
import { PRODUCTS } from "@/lib/catalog";
import visa from "./assets/visa.svg";
import mastercard from "./assets/mastercard.svg";
import amex from "./assets/amex.svg";
import discover from "./assets/discover.svg";
import diners from "./assets/diners.svg";
import jcb from "./assets/jcb.svg";
import maestro from "./assets/maestro.svg";
import unionpay from "./assets/unionpay.svg";
import mir from "./assets/mir.svg";
import elo from "./assets/elo.svg";
import hiper from "./assets/hiper.svg";
import hipercard from "./assets/hipercard.svg";

type Address = { name: string; first: string; last: string; street: string; line2: string; city: string; state: string; zip: string };
type Card = { brand: string; last4: string; type?: string };
type Mode = "summary" | "change" | "add";
const initialAddress: Address = { name: "Home", first: "John", last: "Doe", street: "123 Main Street", line2: "Apt 4B", city: "New York", state: "NY", zip: "10001" };
const workAddress: Address = { name: "Work", first: "John", last: "Doe", street: "456 Main Street", line2: "Apt 8C", city: "New York", state: "NY", zip: "10001" };
const heading = "m-0 font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-sm-font-size) leading-(--semantics-typography-heading-heading-sm-lh-tight) tracking-(--semantics-typography-heading-heading-sm-tracking-tight)";
const body = "font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-md-font-size) leading-(--semantics-typography-body-body-md-lh-normal) tracking-(--semantics-typography-body-body-md-tracking-tight)";
const label = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-md-font-size) leading-(--semantics-typography-label-label-md-lh-snug) tracking-(--semantics-typography-label-label-md-tracking-0-125)";
const labelLarge = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-lg-font-size) leading-(--semantics-typography-button-button-lg-lh-snug) tracking-(--semantics-typography-label-label-lg-tracking-0-125)";
const cardClass = "rounded-(--primitives-radius-rounded-14) border p-(--primitives-spacing-3)";
const actionClass = `font-sans [font-weight:var(--semantics-typography-button-font-weight)] text-(length:--semantics-typography-button-button-md-font-size) leading-(--semantics-typography-button-button-md-lh-snug) tracking-(--semantics-typography-button-tracking-normal) cursor-pointer border-0 bg-transparent p-0 underline [color:var(--semantics-colors-foreground-highlight)] focus-visible:[outline:var(--primitives-ring-focus-width-ring-2)_solid_var(--semantics-colors-border-highlight)]`;
const muted = "[color:var(--semantics-colors-foreground-subtle-on-subtle)]";
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

function Badge() { return <span className="rounded-(--primitives-radius-rounded-sm) border-(length:--primitives-stroke-width-stroke) [border-color:var(--semantics-colors-border-highlight)] [background-color:var(--semantics-colors-background-info-op10)] px-(--primitives-spacing-1) font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-sm-font-size) leading-(--semantics-typography-body-body-sm-lh-normal) tracking-(--semantics-typography-body-body-sm-tracking-tight) [color:var(--semantics-colors-foreground-highlight)]">Default</span>; }
function Divider() { return <div className="mt-(--primitives-spacing-8) mb-(--primitives-spacing-6) border-t-(length:--primitives-stroke-width-stroke-0-75) [border-color:var(--semantics-colors-border-default)]" />; }
function Actions({ onCancel, submit, disabled = false }: { onCancel: () => void; submit: string; disabled?: boolean }) { return <div className="flex justify-end gap-(--primitives-spacing-4)"><Button type="button" variant="outline" size="xs" onClick={onCancel}>Cancel</Button><Button type="submit" size="xs" disabled={disabled}>{submit}</Button></div>; }
type NumericFormat = "zip" | "expiration" | "security";
const cardLogos: Record<string, string> = { visa, mastercard, "american-express": amex, discover, "diners-club": diners, jcb, maestro, unionpay, mir, elo, hiper, hipercard };

function identifyCard(digits: string): CreditCardType | null {
  if (!digits) return null;
  const matches = creditCardType(digits);
  return matches.length === 1 ? matches[0] : null;
}

function CardBrand({ brand }: { brand: CreditCardType }) {
  const logo = cardLogos[brand.type];
  return logo ? <span role="img" aria-label={brand.niceType} className="flex size-(--primitives-spacing-6) shrink-0 items-center justify-center"><img src={logo} alt="" className={`max-h-full max-w-full ${brand.type === "visa" ? "-scale-y-100" : ""}`} /></span> : <span className={label}>{brand.niceType}</span>;
}

function cardLengths(brand: CreditCardType) {
  return brand.type === "visa" || brand.type === "mastercard" ? [16] : brand.lengths;
}

function CardNumberField({ brand, onBrandChange }: { brand: CreditCardType | null; onBrandChange: (brand: CreditCardType | null) => void }) {
  const lengths = brand ? cardLengths(brand) : undefined;
  const pattern = lengths ? lengths.map(length => `([0-9] ?){${length - 1}}[0-9]`).join("|") : "([0-9] ?){11,18}[0-9]";
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const raw = input.value.replace(/\D/g, "");
    const detected = identifyCard(raw);
    const digits = raw.slice(0, detected ? Math.max(...cardLengths(detected)) : 19);
    const caretDigits = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, "").length;
    const gaps = detected?.gaps ?? [4, 8, 12, 16];
    const formatted = Array.from(digits, (digit, index) => `${index && gaps.includes(index) ? " " : ""}${digit}`).join("");
    input.value = formatted;
    let position = 0;
    let count = 0;
    while (position < formatted.length && count < caretDigits) {
      if (/\d/.test(formatted[position])) count++;
      position++;
    }
    input.setSelectionRange(position, position);
    onBrandChange(detected);
  }
  return <Field label="Card number" htmlFor="card-number"><Input id="card-number" name="card-number" placeholder="1234 5678 9012 1234" autoComplete="cc-number" inputMode="numeric" pattern={pattern} title={brand && lengths ? `Enter a ${brand.niceType} card number with ${lengths.join(", ")} digits.` : "Enter a card number with 12 to 19 digits."} required onChange={handleChange} trailing={brand ? <CardBrand brand={brand} /> : undefined} /></Field>;
}

function formatNumericInput(event: ChangeEvent<HTMLInputElement>, format: NumericFormat) {
  const input = event.currentTarget;
  const limits = { zip: 9, expiration: 4, security: 4 };
  const digits = input.value.replace(/\D/g, "").slice(0, limits[format]);
  const digitsBeforeCaret = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, "").length;
  const formatted = format === "expiration" ? digits.replace(/^(\d{2})(?=\d)/, "$1/")
    : format === "zip" ? digits.replace(/^(\d{5})(?=\d)/, "$1-")
    : digits;
  input.value = formatted;
  let position = 0;
  let count = 0;
  while (position < formatted.length && count < digitsBeforeCaret) {
    if (/\d/.test(formatted[position])) count++;
    position++;
  }
  input.setSelectionRange(position, position);
}

function TextField({ id, label: text, placeholder, optional = false, autoComplete, numericFormat, securityLength }: { id: string; label: string; placeholder: string; optional?: boolean; autoComplete?: string; numericFormat?: NumericFormat; securityLength?: number }) {
  const rules = {
    zip: { pattern: "[0-9]{5}(-[0-9]{4})?", title: "Enter a 5-digit ZIP code or ZIP+4." },
    expiration: { pattern: "(0[1-9]|1[0-2])/[0-9]{2}", title: "Enter a valid month and year in MM/YY format." },
    security: { pattern: "[0-9]{3,4}", title: "Enter a 3- or 4-digit security code." },
  };
  return <Field label={text} htmlFor={id} optional={optional}><Input id={id} name={id} placeholder={placeholder} required={!optional} autoComplete={autoComplete} inputMode={numericFormat ? "numeric" : undefined} pattern={numericFormat === "security" && securityLength ? `[0-9]{${securityLength}}` : numericFormat ? rules[numericFormat].pattern : undefined} title={numericFormat === "security" && securityLength ? `Enter a ${securityLength}-digit security code.` : numericFormat ? rules[numericFormat].title : undefined} onChange={numericFormat ? e => formatNumericInput(e, numericFormat) : undefined} /></Field>;
}
function AddressFields({ prefix }: { prefix: string }) { return <>
  <TextField id={`${prefix}-street`} label="Street address" placeholder="Enter your street address" autoComplete="address-line1" />
  <TextField id={`${prefix}-line2`} label="Address line 2" placeholder="e.g. Apt 4B" optional autoComplete="address-line2" />
  <TextField id={`${prefix}-city`} label="City" placeholder="Enter your city" autoComplete="address-level2" />
  <Field label="State" htmlFor={`${prefix}-state`}><Select id={`${prefix}-state`} name={`${prefix}-state`} placeholder="Select an option" required><SelectContent>{["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
  <TextField id={`${prefix}-zip`} label="ZIP code" placeholder="Enter your ZIP code" autoComplete="postal-code" numericFormat="zip" />
</>; }
function AddressLines({ address }: { address: Address }) { return <div className={body}><div className={label}>{address.first} {address.last}</div><div className={muted}>{address.street}{address.line2 ? `, ${address.line2}` : ""}</div><div className={muted}>{address.city}, {address.state} {address.zip}</div></div>; }

export function Checkout() {
  const entries = useBagEntries();
  const total = entries.reduce((sum, entry) => sum + (PRODUCTS.find(p => p.id === entry.productId)?.priceCents ?? 0) * entry.quantity, 0);
  const [addresses, setAddresses] = useState<Address[]>([initialAddress, workAddress]);
  const [addressIndex, setAddressIndex] = useState(0); const [addressDraft, setAddressDraft] = useState(0); const [defaultAddress, setDefaultAddress] = useState<number | null>(0);
  const [cards, setCards] = useState<Card[]>([{ brand: "Visa", last4: "4242", type: "visa" }, { brand: "Mastercard", last4: "3737", type: "mastercard" }]);
  const [cardIndex, setCardIndex] = useState(0); const [cardDraft, setCardDraft] = useState(0); const [defaultCard, setDefaultCard] = useState<number | null>(0);
  const [makeAddressDefault, setMakeAddressDefault] = useState(true); const [makeCardDefault, setMakeCardDefault] = useState(true);
  const [addressMode, setAddressMode] = useState<Mode>("summary"); const [cardMode, setCardMode] = useState<Mode>("summary");
  const [cardBrand, setCardBrand] = useState<CreditCardType | null>(null);
  const [sameBilling, setSameBilling] = useState(true); const [notice, setNotice] = useState(false);
  const address = addresses[addressIndex]; const card = cards[cardIndex];
  function addAddress(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); const value = (key: string) => String(f.get(key) ?? "").trim(); const next = addresses.length; setAddresses([...addresses, { first: value("first"), last: value("last"), name: value("address-name"), street: value("address-street"), line2: value("address-line2"), city: value("address-city"), state: value("address-state"), zip: value("address-zip") }]); setAddressIndex(next); if (f.has("default-address")) setDefaultAddress(next); setAddressMode("summary"); }
  function addCard(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); const digits = String(f.get("card-number") ?? "").replace(/\D/g, ""); const next = cards.length; const detected = identifyCard(digits); setCards([...cards, { brand: detected?.niceType ?? "Card", type: detected?.type, last4: digits.slice(-4) }]); setCardIndex(next); if (f.has("default-card")) setDefaultCard(next); setCardMode("summary"); }
  return <div className="mx-auto w-full max-w-(--semantics-layout-desktop-content-max-width-658) px-(--semantics-layout-mobile-grid-margin) md:px-0 pb-(--primitives-spacing-32)">
    <h1 className="m-0 py-(--primitives-spacing-4) font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-xl-font-size) leading-(--semantics-typography-heading-heading-xl-lh-tight) tracking-(--semantics-typography-heading-heading-xl-tracking-tight)">Checkout</h1>
    <p className={`${body} m-0 mb-(--primitives-spacing-4) [color:var(--semantics-colors-foreground-subtle-on-subtlest)]`}>Prototype checkout: example addresses and payment methods are shown. No payment will be made.</p>
    <section aria-labelledby="shipping-heading"><h2 id="shipping-heading" className={heading}>{addressMode === "summary" ? "Shipping address" : addressMode === "change" ? "Change shipping address" : "Add new address"}</h2>
      {addressMode === "summary" ? <div className={`${cardClass} mt-(--primitives-spacing-2) w-full md:max-w-[20.0625rem] [background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]`}><div className="flex justify-between gap-(--primitives-spacing-2)"><span className={labelLarge}>{address.name}</span>{addressIndex === defaultAddress && <Badge />}</div><div className="mt-(--primitives-spacing-2) flex items-start gap-(--primitives-spacing-1)"><Icon name="map-pin" size={iconBox16} aria-hidden="true" /><AddressLines address={address} /></div><div className="mt-(--primitives-spacing-2) flex items-start gap-(--primitives-spacing-1)"><Icon name="truck" size={iconBox16} aria-hidden="true" /><div className={body}><div className={label}>Standard shipping</div><div>Estimated delivery: <span className={muted}>Nov 23-25, 2026</span></div></div></div><button className={`${actionClass} mt-(--primitives-spacing-2) ml-(--primitives-spacing-out-of-scale-5)`} onClick={() => { setAddressDraft(addressIndex); setMakeAddressDefault(defaultAddress === addressIndex); setAddressMode("change"); }}>Change<span className="sr-only"> shipping address</span></button></div> : addressMode === "change" ? <form className="mt-(--primitives-spacing-2) flex flex-col gap-(--primitives-spacing-4)" onSubmit={e => { e.preventDefault(); setAddressIndex(addressDraft); if (makeAddressDefault) setDefaultAddress(addressDraft); else if (defaultAddress === addressDraft) setDefaultAddress(null); setAddressMode("summary"); }}><div className="grid gap-(--primitives-spacing-4) md:grid-cols-2">{addresses.map((item, i) => <div key={i} className={`${cardClass} ${i === addressDraft ? "[background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]" : "[border-color:var(--semantics-colors-border-default)]"}`}><label className="flex cursor-pointer items-start gap-(--primitives-spacing-4)"><RadioToggle name="address-choice" checked={addressDraft === i} onChange={() => { setAddressDraft(i); setMakeAddressDefault(defaultAddress === i); }} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-(--primitives-spacing-2)"><span className={labelLarge}>{item.name}</span>{i === defaultAddress && <Badge />}</div><div className="mt-(--primitives-spacing-2)"><AddressLines address={item} /></div></div></label>{i === addressDraft && <Checkbox className="mt-(--primitives-spacing-2) gap-(--primitives-spacing-4)" checked={makeAddressDefault} onChange={e => setMakeAddressDefault(e.target.checked)}><span className={body}>Set as default shipping address</span></Checkbox>}</div>)}</div><button type="button" className={`${actionClass} inline-flex items-center gap-(--primitives-spacing-1) self-center`} onClick={() => setAddressMode("add")}><Icon name="plus" size={iconBox16} aria-hidden="true" /> <span>Add new address</span></button><Actions onCancel={() => setAddressMode("summary")} submit="Use this address" /></form> : <form className="mt-(--primitives-spacing-2) flex flex-col gap-(--primitives-spacing-4)" onSubmit={addAddress}><div className="grid gap-(--primitives-spacing-4) md:grid-cols-2"><TextField id="first" label="First name" placeholder="Enter your first name" autoComplete="given-name" /><TextField id="last" label="Last name" placeholder="Enter your last name" autoComplete="family-name" /><AddressFields prefix="address" /><TextField id="address-name" label="Address name" placeholder="e.g. Home, Work" /></div><Checkbox name="default-address" defaultChecked><span className={body}>Set as default shipping address</span></Checkbox><Actions onCancel={() => setAddressMode("change")} submit="Save and use address" /></form>}
      <Divider /></section>
    <section aria-labelledby="payment-heading"><h2 id="payment-heading" className={heading}>{cardMode === "summary" ? "Payment method" : cardMode === "change" ? "Change payment method" : "Add new card"}</h2>
      {cardMode === "summary" ? <div className={`${cardClass} mt-(--primitives-spacing-2) w-full md:max-w-[20.0625rem] [background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]`}><div className="flex items-center gap-(--primitives-spacing-1)"><Icon name="credit-card" size={iconBox16} aria-hidden="true" /><span className={`${label} flex-1`}>{card.brand} ····{card.last4}</span>{cardIndex === defaultCard && <Badge />}</div><button className={`${actionClass} mt-(--primitives-spacing-2) ml-(--primitives-spacing-out-of-scale-5)`} onClick={() => { setCardDraft(cardIndex); setMakeCardDefault(defaultCard === cardIndex); setCardMode("change"); }}>Change<span className="sr-only"> payment method</span></button></div> : cardMode === "change" ? <form className="mt-(--primitives-spacing-2) flex flex-col gap-(--primitives-spacing-4)" onSubmit={e => { e.preventDefault(); setCardIndex(cardDraft); if (makeCardDefault) setDefaultCard(cardDraft); else if (defaultCard === cardDraft) setDefaultCard(null); setCardMode("summary"); }}><div className="grid gap-(--primitives-spacing-4) md:grid-cols-2">{cards.map((item, i) => <div key={i} className={`${cardClass} ${i === cardDraft ? "[background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]" : "[border-color:var(--semantics-colors-border-default)]"}`}><label className="flex cursor-pointer items-center gap-(--primitives-spacing-4)"><RadioToggle name="card-choice" checked={cardDraft === i} onChange={() => { setCardDraft(i); setMakeCardDefault(defaultCard === i); }} /><span className="flex min-w-0 flex-1 items-center gap-(--primitives-spacing-1)">{item.type && cardLogos[item.type] && <CardBrand brand={creditCardType.getTypeInfo(item.type)} />}<span className={`${label} min-w-0 truncate`}>{item.brand} ····{item.last4}</span></span>{i === defaultCard && <Badge />}</label>{i === cardDraft && <Checkbox className="mt-(--primitives-spacing-2) gap-(--primitives-spacing-4)" checked={makeCardDefault} onChange={e => setMakeCardDefault(e.target.checked)}><span className={body}>Set as default payment method</span></Checkbox>}</div>)}</div><button type="button" className={`${actionClass} inline-flex items-center gap-(--primitives-spacing-1) self-center`} onClick={() => { setCardBrand(null); setCardMode("add"); }}><Icon name="plus" size={iconBox16} aria-hidden="true" /> <span>Add new card</span></button><Actions onCancel={() => setCardMode("summary")} submit="Use this card" /></form> : <form className="mt-(--primitives-spacing-2) flex flex-col gap-(--primitives-spacing-4)" onSubmit={addCard}><div className="grid gap-(--primitives-spacing-4) md:grid-cols-2"><TextField id="cardholder" label="Cardholder name" placeholder="Enter the name on card" autoComplete="cc-name" /><CardNumberField brand={cardBrand} onBrandChange={setCardBrand} /><TextField id="expiration" label="Expiration date" placeholder="MM/YY" autoComplete="cc-exp" numericFormat="expiration" /><TextField id="security" label="Security code" placeholder={cardBrand?.code.name ?? "CVV"} autoComplete="cc-csc" numericFormat="security" securityLength={cardBrand?.code.size} /></div><Checkbox name="default-card" defaultChecked><span className={body}>Set as default payment method</span></Checkbox><Checkbox checked={sameBilling} onChange={e => setSameBilling(e.target.checked)}><span className={body}>Billing address same as shipping address</span></Checkbox>{!sameBilling && <div className="grid gap-(--primitives-spacing-4) md:grid-cols-2"><AddressFields prefix="billing" /></div>}<Actions onCancel={() => setCardMode("change")} submit="Save and use card" /></form>}
      <Divider /></section>
    <section aria-label="Order summary" className={labelLarge}><div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div><div className="mt-(--primitives-spacing-2) flex justify-between"><span>Shipping</span><span>Free</span></div><Divider /><div className="flex justify-between [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-lg-font-size) leading-(--semantics-typography-heading-heading-lg-lh-tight) tracking-(--semantics-typography-heading-heading-lg-tracking-tight)"><span>Total</span><span>{money(total)}</span></div><div className="mt-(--primitives-spacing-8) flex justify-center"><Button size="lg" className="w-full md:max-w-[22.375rem]" disabled={entries.length === 0 || addressMode !== "summary" || cardMode !== "summary"} onClick={() => setNotice(true)}>Confirm and pay</Button></div>{notice && <p role="status" className="mt-(--primitives-spacing-4) text-center">This is a checkout prototype. No payment was made.</p>}</section>
  </div>;
}
