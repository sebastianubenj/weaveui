import { useEffect, useState, type FormEvent } from "react";
import { Menu } from "@base-ui/react/menu";
import { ValidationForm } from "@/components/form-validation";
import { Dialog } from "@base-ui/react/dialog";
import creditCardType from "credit-card-type";
import type { CreditCardType } from "credit-card-type/dist/types";
import { Button, Checkbox, Field, Icon, PageHeader, Select, SelectContent, SelectItem, iconBox16 } from "@weaveui/ds";
import { AddressFields } from "@/components/address/address-fields";
import { CardBrand, CardNumberField, TextField } from "@/components/payment/card-fields";
import { PaymentEmptyState } from "@/components/payment/payment-empty-state";
import { useAddresses } from "@/lib/addresses-context";
import { identifyCard } from "@/lib/identify-card";
import { useViewNavigation } from "@/lib/view-navigation";
import { usePaymentMethods, type BillingAddress, type PaymentCard } from "@/lib/payment-methods-context";

const heading = "m-0 font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-sm-font-size) leading-(--semantics-typography-heading-heading-sm-lh-tight) tracking-(--semantics-typography-heading-heading-sm-tracking-tight)";
const label = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-md-font-size) leading-(--semantics-typography-label-label-md-lh-snug) tracking-(--semantics-typography-label-label-md-tracking-0-125)";
const body = "font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-md-font-size) leading-(--semantics-typography-body-body-md-lh-normal) tracking-(--semantics-typography-body-body-md-tracking-tight)";
const menuItem = "flex w-full items-center rounded-(--primitives-radius-rounded-10) px-(--primitives-spacing-2) py-(--primitives-spacing-out-of-scale-2-5) font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-lg-font-size) leading-(--semantics-typography-body-body-lg-lh-normal) tracking-(--semantics-typography-body-body-lg-tracking-tight) outline-none data-[highlighted]:[background-color:var(--semantics-colors-background-subtle)] data-[disabled]:opacity-(--primitives-opacity-opacity-50)";
const cardBox = "rounded-(--primitives-radius-rounded-14) border-(length:--primitives-stroke-width-stroke) p-(--primitives-spacing-3)";
function Badge() { return <span data-badge className="rounded-(--primitives-radius-rounded-sm) border-(length:--primitives-stroke-width-stroke) [border-color:var(--semantics-colors-border-highlight)] [background-color:var(--semantics-colors-background-info-op10)] px-(--primitives-spacing-1) font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-sm-font-size) leading-(--semantics-typography-body-body-sm-lh-normal) tracking-(--semantics-typography-body-body-sm-tracking-tight) [color:var(--semantics-colors-foreground-highlight)]">Default</span>; }
function BillingLines({ address }: { address: BillingAddress }) { return <div className={`${body} [color:var(--semantics-colors-foreground-subtle-on-subtle)]`}><div>{address.street}{address.line2 ? `, ${address.line2}` : ""}</div><div>{address.city}, {address.state} {address.zip}</div></div>; }
function CardIdentity({ card, isDefault }: { card: PaymentCard; isDefault: boolean }) { return <div className="flex min-w-0 items-center gap-(--primitives-spacing-1)">{card.type && <CardBrand brand={creditCardType.getTypeInfo(card.type)} />}<span className={`${label} truncate`}>{card.brand} ····{card.last4}</span>{isDefault && <Badge />}</div>; }
function CardMenu({ card, isDefault, onEdit, onDefault, onDelete }: { card: PaymentCard; isDefault: boolean; onEdit: () => void; onDefault: () => void; onDelete: () => void }) {
  return <Menu.Root><Menu.Trigger render={<Button variant="ghost" surface={isDefault ? "on-subtle" : "default"} size="icon-xs" icon="ellipsis-vertical" aria-label={`Options for ${card.brand} ending in ${card.last4}`} />} /><Menu.Portal><Menu.Positioner side="bottom" sideOffset={4} align="end" className="z-(--semantics-layer-popover) outline-none"><Menu.Popup className="w-(--primitives-spacing-out-of-scale-40) rounded-(--primitives-radius-rounded-14) [background-color:var(--semantics-colors-background-default)] p-(--primitives-spacing-1) [box-shadow:var(--effect-shadows-popover-0),var(--effect-shadows-popover-1)] outline-none">{!isDefault && <Menu.Item onClick={onDefault} className={`${menuItem} cursor-pointer [color:var(--semantics-colors-foreground-default)]`}>Set as default</Menu.Item>}<Menu.Item onClick={onEdit} className={`${menuItem} cursor-pointer [color:var(--semantics-colors-foreground-default)]`}>Edit billing address</Menu.Item><Menu.Item onClick={onDelete} className={`${menuItem} cursor-pointer [color:var(--semantics-colors-foreground-destructive)]`}>Delete</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>;
}
export function PaymentMethods() {
  const { cards, defaultCardId, addCard, deleteCard, setDefaultCardId, updateBillingAddress } = usePaymentMethods();
  const { addresses, defaultAddressId } = useAddresses();
  const shipping = addresses.find(address => address.id === defaultAddressId);
  const { pathname, open, back } = useViewNavigation("/payment-methods");
  const adding = pathname === "/payment-methods/new";
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replacementId, setReplacementId] = useState<string | null>(null);
  const deleting = cards.find(card => card.id === deletingId);
  const remaining = cards.filter(card => card.id !== deletingId);
  const deletingDefault = deleting?.id === defaultCardId;
  const needsReplacement = deletingDefault && remaining.length > 1;
  const editingId = pathname.match(/^\/payment-methods\/([^/]+)\/billing-address$/)?.[1];
  const editing = cards.find(card => card.id === editingId);
  const [brand, setBrand] = useState<CreditCardType | null>(null);
  const [sameBilling, setSameBilling] = useState(true);
  useEffect(() => {
    if (!adding) return;
    return () => { setBrand(null); setSameBilling(true); };
  }, [adding]);
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (key: string) => String(fields.get(key) ?? "").trim();
    const billingAddress: BillingAddress = !editing && sameBilling && shipping
      ? { street: shipping.street, line2: shipping.line2, city: shipping.city, state: shipping.state, zip: shipping.zip }
      : { street: value("payment-billing-street"), line2: value("payment-billing-line2"), city: value("payment-billing-city"), state: value("payment-billing-state"), zip: value("payment-billing-zip") };
    if (editing) updateBillingAddress(editing.id, billingAddress);
    else {
      const digits = value("card-number").replace(/\D/g, "");
      const detected = identifyCard(digits);
      addCard({ id: crypto.randomUUID(), brand: detected?.niceType ?? "Card", type: detected?.type, last4: digits.slice(-4), billingAddress }, fields.has("default-card"));
    }
    back();
  }
  return <div className="mx-auto w-full max-w-(--semantics-layout-desktop-content-max-width-658) px-(--semantics-layout-mobile-grid-margin) pb-(--primitives-spacing-32) md:px-0">
    <PageHeader title="Payment methods" titleAs="h1" description={cards.length > 0 || adding || editing ? "Manage your saved payment methods." : undefined} className="py-(--primitives-spacing-4) md:[&_[data-slot=title]]:[font-weight:var(--semantics-typography-heading-font-weight)] md:[&_[data-slot=title]]:text-(length:--semantics-typography-heading-heading-xl-font-size) md:[&_[data-slot=title]]:leading-(--semantics-typography-heading-heading-xl-lh-tight) md:[&_[data-slot=title]]:tracking-(--semantics-typography-heading-heading-xl-tracking-tight)" />
    {!adding && !editing && cards.length === 0 ? <div className="pt-(--primitives-spacing-4)"><PaymentEmptyState titleAs="h2" buttonSize="lg" description="Add a payment method to make your next checkout faster." onAdd={() => { setBrand(null); setSameBilling(true); open("/payment-methods/new"); }} /></div> : adding || editing ? <section aria-labelledby="payment-form-heading"><h2 id="payment-form-heading" className={heading}>{editing ? "Edit billing address" : "Add new card"}</h2>
      <ValidationForm className="mt-(--primitives-spacing-2) flex flex-col gap-(--primitives-spacing-8)" onSubmit={save}>
        <div className="flex flex-col gap-(--primitives-spacing-4)">
          {editing ? <div className={`${cardBox} w-full md:max-w-[20.0625rem] [background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]`}><CardIdentity card={editing} isDefault={editing.id === defaultCardId} /></div> : <><div className="grid gap-(--primitives-spacing-4) md:grid-cols-2"><TextField id="cardholder" label="Cardholder name" placeholder="Enter the name on card" autoComplete="cc-name" /><CardNumberField brand={brand} onBrandChange={setBrand} /><TextField id="expiration" label="Expiration date" placeholder="MM/YY" autoComplete="cc-exp" numericFormat="expiration" /><TextField id="security" label="Security code" placeholder={brand?.code.name ?? "CVV"} autoComplete="cc-csc" numericFormat="security" securityLength={brand?.code.size} /></div>{cards.length > 0 && <Checkbox name="default-card"><span className={body}>Set as default payment method</span></Checkbox>}{shipping && <div className="flex flex-col gap-(--primitives-spacing-4)"><Checkbox checked={sameBilling} onChange={event => setSameBilling(event.target.checked)}><span className={body}>Use default shipping address as billing address</span></Checkbox>{sameBilling && <div className={`${cardBox} w-full md:max-w-[20.0625rem] [background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]`}><div className="flex justify-between gap-(--primitives-spacing-2)"><span className={label}>Default shipping address</span><Badge /></div><BillingLines address={shipping} /></div>}</div>}</>}
          {(editing || !shipping || !sameBilling) && <div className="grid gap-(--primitives-spacing-4) md:grid-cols-2"><AddressFields prefix="payment-billing" values={editing?.billingAddress} /></div>}
        </div>
        <div className="flex gap-(--primitives-spacing-4) md:justify-end"><Button type="button" variant="outline" size="lg" className="flex-1 md:flex-none" onClick={() => back()}>Cancel</Button><Button type="submit" size="lg" className="flex-1 md:flex-none">{editing ? "Save changes" : "Save card"}</Button></div>
      </ValidationForm>
    </section> : <section aria-labelledby="saved-cards-heading"><h2 id="saved-cards-heading" className={heading}>Your saved cards</h2>
      <div className="mt-(--primitives-spacing-2) grid gap-(--primitives-spacing-4) md:grid-cols-2">{cards.map(card => { const isDefault = card.id === defaultCardId; return <article key={card.id} className={`${cardBox} ${isDefault ? "[background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]" : "[background-color:var(--semantics-colors-background-default)] [border-color:var(--semantics-colors-border-default)]"}`}><div className="flex items-center justify-between gap-(--primitives-spacing-2)"><CardIdentity card={card} isDefault={isDefault} /><CardMenu card={card} isDefault={isDefault} onEdit={() => open(`/payment-methods/${encodeURIComponent(card.id)}/billing-address`)} onDefault={() => setDefaultCardId(card.id)} onDelete={() => { setReplacementId(null); setDeletingId(card.id); }} /></div><div className="mt-(--primitives-spacing-2) border-t-(length:--primitives-stroke-width-stroke-0-75) [border-color:var(--semantics-colors-border-default)] pt-(--primitives-spacing-2)"><div className={label}>Billing address</div><BillingLines address={card.billingAddress} /></div></article>; })}</div>
      <div className="mt-(--primitives-spacing-4) flex justify-center"><button type="button" onClick={() => { setBrand(null); setSameBilling(true); open("/payment-methods/new"); }} className="inline-flex cursor-pointer items-center gap-(--primitives-spacing-1) rounded-(--primitives-radius-rounded-sm) border-0 bg-transparent p-0 font-sans [font-weight:var(--semantics-typography-button-font-weight)] text-(length:--semantics-typography-button-button-md-font-size) leading-(--semantics-typography-button-button-md-lh-snug) tracking-(--semantics-typography-button-tracking-normal) underline [color:var(--semantics-colors-foreground-highlight)] focus-visible:[outline:var(--primitives-ring-focus-width-ring-2)_solid_var(--semantics-colors-border-highlight)]"><Icon name="plus" size={iconBox16} aria-hidden="true" />Add new card</button></div>
    </section>}
    {deleting && <Dialog.Root open onOpenChange={open => { if (!open) setDeletingId(null); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--semantics-layer-popover) [background-color:var(--semantics-colors-background-subtle-op60)] [backdrop-filter:blur(var(--semantics-background-blur-bg-blur-16-css))]" />
        <Dialog.Viewport className="fixed inset-0 z-(--semantics-layer-popover) flex items-center justify-center overflow-y-auto p-(--semantics-layout-mobile-grid-margin)">
          <Dialog.Popup className="w-full max-w-[31.25rem] rounded-(--primitives-radius-rounded-3xl) [background-color:var(--semantics-colors-background-default)] p-(--primitives-spacing-4) outline-none">
            <div className="flex flex-col gap-(--primitives-spacing-4)">
              <div className="flex flex-col gap-(--primitives-spacing-1)">
                <Dialog.Title className="m-0 text-center font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-xl-font-size) leading-(--semantics-typography-heading-heading-xl-lh-tight) tracking-(--semantics-typography-heading-heading-xl-tracking-tight)">{deletingDefault && remaining.length ? "Delete default payment method?" : "Delete card?"}</Dialog.Title>
                <Dialog.Description className="m-0 text-center [color:var(--semantics-colors-foreground-subtle)] font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-lg-font-size) leading-(--semantics-typography-body-body-lg-lh-normal) tracking-(--semantics-typography-body-body-lg-tracking-tight)">{needsReplacement ? "Select a new default payment method before deleting this one." : deletingDefault && remaining.length === 1 ? <><span className={label}>{remaining[0].brand} ····{remaining[0].last4}</span> will become your new default payment method.</> : "Are you sure you want to delete this card from your payment methods?"}</Dialog.Description>
              </div>
              <div className={`${cardBox} mx-auto w-full md:max-w-[22.375rem] [background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]`}><CardIdentity card={deleting} isDefault={Boolean(deletingDefault)} /></div>
              {needsReplacement && <div className="mx-auto w-full md:max-w-[22.375rem]"><Field label="New default card" htmlFor="replacement-card"><Select id="replacement-card" value={replacementId} onValueChange={setReplacementId} placeholder="Select a card"><SelectContent>{remaining.map(card => <SelectItem key={card.id} value={card.id}>{card.brand} – ····{card.last4}</SelectItem>)}</SelectContent></Select></Field></div>}
            </div>
            <div className="mt-(--primitives-spacing-8) flex flex-col gap-(--primitives-spacing-4) md:hidden">
              <Button variant="destructive" size="lg" className="w-full" disabled={Boolean(needsReplacement && !replacementId)} onClick={() => { deleteCard(deleting.id, replacementId ?? undefined); setDeletingId(null); }}>Delete card</Button>
              <Dialog.Close render={<Button variant="outline" size="lg" className="w-full" />}>Cancel</Dialog.Close>
            </div>
            <div className="mt-(--primitives-spacing-8) hidden gap-(--primitives-spacing-4) md:flex">
              <Dialog.Close render={<Button variant="outline" size="lg" className="flex-1" />}>Cancel</Dialog.Close>
              <Button variant="destructive" size="lg" className="flex-1" disabled={Boolean(needsReplacement && !replacementId)} onClick={() => { deleteCard(deleting.id, replacementId ?? undefined); setDeletingId(null); }}>Delete card</Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>}
  </div>;
}
