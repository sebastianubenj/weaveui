import { Button, Icon, PageHeader, iconBox16 } from "@weaveui/ds";

export interface ConfirmedOrder {
  id: string;
  items: { id: string; name: string; src: string; priceCents: number; quantity: number }[];
  address: { name: string; first: string; last: string; street: string; line2: string; city: string; state: string; zip: string };
  card: { brand: string; last4: string; type?: string };
  total: number;
}

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const heading = "m-0 font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-sm-font-size) leading-(--semantics-typography-heading-heading-sm-lh-tight) tracking-(--semantics-typography-heading-heading-sm-tracking-tight)";
const label = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-lg-font-size) leading-(--semantics-typography-button-button-lg-lh-snug) tracking-(--semantics-typography-label-label-lg-tracking-0-125)";
const body = "font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-md-font-size) leading-(--semantics-typography-body-body-md-lh-normal) tracking-(--semantics-typography-body-body-md-tracking-tight)";
const smallLabel = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-md-font-size) leading-(--semantics-typography-label-label-md-lh-snug) tracking-(--semantics-typography-label-label-md-tracking-0-125)";
const divider = "border-t-(length:--primitives-stroke-width-stroke-0-75) [border-color:var(--semantics-colors-border-default)]";
const box = "flex flex-1 flex-col gap-(--primitives-spacing-2) rounded-(--primitives-radius-rounded-14) border-(length:--primitives-stroke-width-stroke) [border-color:var(--semantics-colors-border-transparent)] [background-color:var(--semantics-colors-background-subtle)] p-(--primitives-spacing-3)";

export function OrderConfirmed({ order, onContinue }: { order: ConfirmedOrder; onContinue: () => void }) {
  const { items, address, card, total } = order;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="mx-auto w-full max-w-(--semantics-layout-desktop-content-max-width-658) px-(--semantics-layout-mobile-grid-margin) pb-(--primitives-spacing-32) md:px-0">
    <div className="flex flex-col items-center pt-(--primitives-spacing-4) pb-(--primitives-spacing-6)">
      <div className="relative size-(--primitives-spacing-out-of-scale-30) overflow-hidden"><img src="/order-confirmed.png" alt="" className="absolute top-[-9.49%] left-[-9.49%] size-[118.98%] max-w-none" /></div>
      <PageHeader title="Order confirmed!" titleAs="h1" description="Your demo order is ready. No payment was made or confirmation email sent." className="items-center pt-(--primitives-spacing-8) text-center md:pt-(--primitives-spacing-8) md:[&_[data-slot=title]]:[font-weight:var(--semantics-typography-heading-font-weight)] md:[&_[data-slot=title]]:text-(length:--semantics-typography-heading-heading-xl-font-size) md:[&_[data-slot=title]]:leading-(--semantics-typography-heading-heading-xl-lh-tight) md:[&_[data-slot=title]]:tracking-(--semantics-typography-heading-heading-xl-tracking-tight)" />
      <p className={`${label} m-0 mt-(--primitives-spacing-4)`}>Demo order #{order.id}</p>
    </div>
    <section aria-labelledby="order-summary-heading">
      <div className="flex items-center justify-between pb-(--primitives-spacing-4)"><h2 id="order-summary-heading" className={heading}>Order summary</h2><span className={heading}>{count} {count === 1 ? "item" : "items"}</span></div>
      <ul className="m-0 flex list-none flex-col gap-(--primitives-spacing-4) p-0">{items.map(item => <li key={item.id} className="flex items-center gap-(--primitives-spacing-2)">
        <img src={item.src} alt="" className="size-(--primitives-spacing-12) shrink-0 object-contain [background-color:var(--semantics-colors-background-subtle)] md:size-(--primitives-spacing-16)" />
        <div className="min-w-0 flex-1"><p className={`${label} m-0`}>{item.name}</p><div className="flex justify-between gap-(--primitives-spacing-2)"><span className={body}>x{item.quantity}</span><span className={label}>{money(item.priceCents * item.quantity)}</span></div></div>
      </li>)}</ul>
      <div className={`mt-(--primitives-spacing-8) pt-(--primitives-spacing-6) ${divider} ${label}`}><div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div><div className="mt-(--primitives-spacing-2) flex justify-between"><span>Shipping</span><span>Free</span></div></div>
      <div className={`mt-(--primitives-spacing-8) flex justify-between pt-(--primitives-spacing-6) font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-lg-font-size) leading-(--semantics-typography-heading-heading-lg-lh-tight) tracking-(--semantics-typography-heading-heading-lg-tracking-tight) ${divider}`}><span>Total</span><span>{money(total)}</span></div>
    </section>
    <div className={`mt-(--primitives-spacing-8) grid gap-(--primitives-spacing-4) pt-(--primitives-spacing-6) md:grid-cols-2 ${divider}`}>
      <section className="flex flex-col gap-(--primitives-spacing-2)"><h2 className={heading}>Payment details</h2><div className={box}><div className={`flex items-center gap-(--primitives-spacing-1) ${smallLabel}`}><Icon name="credit-card" size={iconBox16} aria-hidden="true" /><span>{card.brand} ····{card.last4}</span></div><p className={`${body} m-0 [color:var(--semantics-colors-foreground-subtle-on-subtle)]`}>Demo payment details</p></div></section>
      <section className="flex flex-col gap-(--primitives-spacing-2)"><h2 className={heading}>Shipping details</h2><div className={box}><div className="flex items-start gap-(--primitives-spacing-1)"><Icon name="map-pin" size={iconBox16} aria-hidden="true" /><div className={body}><div className={smallLabel}>{address.first} {address.last}</div><div className="[color:var(--semantics-colors-foreground-subtle-on-subtle)]">{address.street}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.zip}</div></div></div><div className="flex items-start gap-(--primitives-spacing-1)"><Icon name="truck" size={iconBox16} aria-hidden="true" /><span className={smallLabel}>Standard shipping</span></div></div></section>
    </div>
    <div className="mt-(--primitives-spacing-8) flex justify-center"><Button size="lg" className="w-full md:max-w-[22.375rem]" onClick={onContinue}>Continue shopping</Button></div>
  </div>;
}
