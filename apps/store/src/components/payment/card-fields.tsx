import type { ChangeEvent } from "react";
import { identifyCard } from "@/lib/identify-card";
import type { CreditCardType } from "credit-card-type/dist/types";
import { Field, Input } from "@weaveui/ds";
import visa from "@/views/checkout/assets/visa.svg";
import mastercard from "@/views/checkout/assets/mastercard.svg";
import amex from "@/views/checkout/assets/amex.svg";
import discover from "@/views/checkout/assets/discover.svg";
import diners from "@/views/checkout/assets/diners.svg";
import jcb from "@/views/checkout/assets/jcb.svg";
import maestro from "@/views/checkout/assets/maestro.svg";
import unionpay from "@/views/checkout/assets/unionpay.svg";
import mir from "@/views/checkout/assets/mir.svg";
import elo from "@/views/checkout/assets/elo.svg";
import hiper from "@/views/checkout/assets/hiper.svg";
import hipercard from "@/views/checkout/assets/hipercard.svg";


const label = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-md-font-size) leading-(--semantics-typography-label-label-md-lh-snug) tracking-(--semantics-typography-label-label-md-tracking-0-125)";
type NumericFormat = "expiration" | "security";
const cardLogos: Record<string, string> = { visa, mastercard, "american-express": amex, discover, "diners-club": diners, jcb, maestro, unionpay, mir, elo, hiper, hipercard };

export function CardBrand({ brand }: { brand: CreditCardType }) {
  const logo = cardLogos[brand.type];
  return logo ? <span role="img" aria-label={brand.niceType} className="flex size-(--primitives-spacing-6) shrink-0 items-center justify-center"><img src={logo} alt="" className={`max-h-full max-w-full ${brand.type === "visa" ? "-scale-y-100" : ""}`} /></span> : <span className={label}>{brand.niceType}</span>;
}

function cardLengths(brand: CreditCardType) {
  return brand.type === "visa" || brand.type === "mastercard" ? [16] : brand.lengths;
}

export function CardNumberField({ brand, onBrandChange }: { brand: CreditCardType | null; onBrandChange: (brand: CreditCardType | null) => void }) {
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
  const limits = { expiration: 4, security: 4 };
  const digits = input.value.replace(/\D/g, "").slice(0, limits[format]);
  const digitsBeforeCaret = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, "").length;
  const formatted = format === "expiration" ? digits.replace(/^(\d{2})(?=\d)/, "$1/")
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

export function TextField({ id, label: text, placeholder, optional = false, autoComplete, numericFormat, securityLength }: { id: string; label: string; placeholder: string; optional?: boolean; autoComplete?: string; numericFormat?: NumericFormat; securityLength?: number }) {
  const rules = {
    expiration: { pattern: "(0[1-9]|1[0-2])/[0-9]{2}", title: "Enter a valid month and year in MM/YY format." },
    security: { pattern: "[0-9]{3,4}", title: "Enter a 3- or 4-digit security code." },
  };
  return <Field label={text} htmlFor={id} optional={optional}><Input id={id} name={id} placeholder={placeholder} required={!optional} autoComplete={autoComplete} inputMode={numericFormat ? "numeric" : undefined} pattern={numericFormat === "security" && securityLength ? `[0-9]{${securityLength}}` : numericFormat ? rules[numericFormat].pattern : undefined} title={numericFormat === "security" && securityLength ? `Enter a ${securityLength}-digit security code.` : numericFormat ? rules[numericFormat].title : undefined} onChange={numericFormat ? e => formatNumericInput(e, numericFormat) : undefined} /></Field>;
}
