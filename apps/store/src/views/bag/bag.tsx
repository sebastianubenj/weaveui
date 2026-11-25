import { Button, Link } from "@weaveui/ds";
import { changeBagQuantity, removeFromBag, useBagEntries } from "@/lib/bag";
import { PRODUCTS } from "@/lib/catalog";
import { useAuth } from "@/lib/auth-context";

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const label = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-lg-font-size) leading-(--semantics-typography-button-button-lg-lh-snug) tracking-(--semantics-typography-label-label-lg-tracking-0-125)";

export function Bag() {
  const entries = useBagEntries();
  const { loggedIn } = useAuth();
  const items = entries.flatMap((entry) => {
    const product = PRODUCTS.find((item) => item.id === entry.productId);
    return product ? [{ ...entry, product }] : [];
  });
  const total = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);

  return (
    <div className="mx-auto w-full max-w-(--semantics-layout-desktop-content-max-width-658) px-(--semantics-layout-mobile-grid-margin) md:px-0 pt-(--primitives-spacing-8) pb-(--primitives-spacing-32) min-h-(--primitives-spacing-out-of-scale-96)">
      <h1 className="m-0 font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-xl-font-size) leading-(--semantics-typography-heading-heading-xl-lh-tight) tracking-(--semantics-typography-heading-heading-xl-tracking-tight)">{items.length ? "Bag" : "Your bag is empty"}</h1>
      {items.length === 0 ? (
        <p className="mt-(--primitives-spacing-4) font-sans text-(length:--semantics-typography-body-body-lg-font-size) leading-(--semantics-typography-body-body-lg-lh-normal) [color:var(--semantics-colors-foreground-subtle-on-subtlest)]">
          {loggedIn ? "Start adding items." : <><Link href="/login" className="[color:var(--semantics-colors-foreground-highlight)]">Log in</Link> or start adding items.</>}
        </p>
      ) : <>
        <ul className="m-0 mt-(--primitives-spacing-4) flex list-none flex-col gap-(--primitives-spacing-4) p-0">
          {items.map(({ product, quantity }) => <li key={product.id} className="flex items-center gap-(--primitives-spacing-4)">
            <img src={product.src} alt={product.alt} className="size-(--primitives-spacing-16) shrink-0 object-contain md:size-(--primitives-spacing-24) [background-color:var(--semantics-colors-background-subtle)]" />
            <div className="min-w-0 flex-1">
              <div className={`${label} flex items-start justify-between gap-(--primitives-spacing-2)`}><span>{product.name}</span><span className="shrink-0">{money(product.priceCents * quantity)}</span></div>
              <div className="mt-(--primitives-spacing-2) flex items-center justify-between">
                <div className="flex items-center gap-(--primitives-spacing-1)">
                  <Button size="icon-xs" icon="minus" aria-label={`Decrease quantity of ${product.name}`} disabled={quantity === 1} onClick={() => changeBagQuantity(product.id, -1)} />
                  <span className={`${label} min-w-(--primitives-spacing-6) text-center`} aria-label={`Quantity: ${quantity}`}>{quantity}</span>
                  <Button size="icon-xs" icon="plus" aria-label={`Increase quantity of ${product.name}`} onClick={() => changeBagQuantity(product.id, 1)} />
                </div>
                <Button size="icon-xs" variant="destructive" icon="trash-2" aria-label={`Remove ${product.name}`} onClick={() => removeFromBag(product.id)} />
              </div>
            </div>
          </li>)}
        </ul>
        <div className={`${label} mt-(--primitives-spacing-8) border-t-(length:--primitives-stroke-width-stroke-0-75) [border-color:var(--semantics-colors-border-default)] pt-(--primitives-spacing-6)`}>
          <div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div>
          <div className="mt-(--primitives-spacing-2) flex justify-between"><span>Shipping</span><span>Free</span></div>
          <div className="mt-(--primitives-spacing-8) flex justify-between border-t-(length:--primitives-stroke-width-stroke-0-75) [border-color:var(--semantics-colors-border-default)] pt-(--primitives-spacing-6) [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-lg-font-size) leading-(--semantics-typography-heading-heading-lg-lh-tight) tracking-(--semantics-typography-heading-heading-lg-tracking-tight)"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <div className="mt-(--primitives-spacing-8) flex justify-center"><Button size="lg" className="w-full md:max-w-[22.375rem]">Go to checkout</Button></div>
      </>}
    </div>
  );
}
