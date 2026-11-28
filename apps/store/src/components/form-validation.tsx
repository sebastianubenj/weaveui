import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { identifyCard } from "@/lib/identify-card";
import { ValidationContext } from "@/components/form-validation-context";

function message(value: string, rule: string, length?: number): string | undefined {
  const text = value.trim();
  const required: Record<string, string> = {
    first: "Enter your first name.", last: "Enter your last name.", street: "Enter your street address.", city: "Enter your city.", state: "Select a state.", zip: "Enter your ZIP code.", name: "Enter an address name, such as Home or Work.", cardholder: "Enter the name on your card.", card: "Enter your card number.", expiration: "Enter the expiration date.", security: "Enter the security code.",
  };
  if (!text) return required[rule];
  if (rule === "zip" && !/^\d{5}(-\d{4})?$/.test(text)) return "Enter a valid ZIP code, such as 10001 or 10001-1234.";
  if (rule === "card") {
    const digits = text.replace(/\D/g, "");
    let sum = 0;
    for (let i = digits.length - 1; i >= 0; i--) { let n = Number(digits[i]); if ((digits.length - i) % 2 === 0) { n *= 2; if (n > 9) n -= 9; } sum += n; }
    const brand = identifyCard(digits);
    const lengths = brand ? (brand.type === "visa" || brand.type === "mastercard" ? [16] : brand.lengths) : undefined;
    if (digits.length < 12 || digits.length > 19 || (lengths && !lengths.includes(digits.length)) || sum % 10 !== 0) return "Enter a valid card number.";
  }
  if (rule === "expiration") {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(text)) return "Enter a valid expiration date in MM/YY format.";
    const [month, year] = text.split("/").map(Number); const now = new Date();
    if (2000 + year < now.getFullYear() || (2000 + year === now.getFullYear() && month < now.getMonth() + 1)) return "This card has expired.";
  }
  if (rule === "security" && !(length ? new RegExp(`^\\d{${length}}$`) : /^\d{3,4}$/).test(text)) return length ? `Enter the ${length}-digit security code.` : "Enter a 3- or 4-digit security code.";
  return undefined;
}

export function ValidationForm({ children, onSubmit, ...props }: Omit<React.ComponentProps<"form">, "onSubmit"> & { children: ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dirty = useRef(new Set<string>());
  function update(id: string, value: string, rule: string, length?: number) {
    const error = message(value, rule, length);
    setErrors(current => { const next = { ...current }; if (error) next[id] = error; else delete next[id]; return next; });
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget; const data = new FormData(form); const next: Record<string, string> = {}; let first: HTMLElement | null = null;
    for (const element of form.querySelectorAll<HTMLElement>("[data-validation-rule]")) {
      const id = element.dataset.validationId ?? element.id;
      const rule = element.dataset.validationRule!;
      const value = element instanceof HTMLInputElement ? element.value : String(data.get(id) ?? "");
      const error = message(value, rule, element.dataset.validationLength ? Number(element.dataset.validationLength) : undefined);
      const control = element instanceof HTMLInputElement ? element : element.querySelector<HTMLElement>('[role="combobox"]');
      if (!error && element instanceof HTMLInputElement && rule === "card" && !element.validity.valid) { next[id] = "Enter a valid card number."; first ??= control; }
      else if (error) { next[id] = error; first ??= control; }
    }
    setErrors(next);
    if (first) { first.focus(); return; }
    onSubmit(event);
  }
  return <ValidationContext.Provider value={{ errors, change: (id, value, rule, length) => { dirty.current.add(id); if (errors[id]) update(id, value, rule, length); }, blur: (id, value, rule, length) => { if (dirty.current.has(id) || errors[id]) update(id, value, rule, length); } }}><form {...props} noValidate onSubmit={submit}>{children}</form></ValidationContext.Provider>;
}
