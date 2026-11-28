import { Button, PageHeader } from "@weaveui/ds";

export function PaymentEmptyState({ titleAs, buttonSize, description, onAdd }: { titleAs: "h2" | "h3"; buttonSize: "lg" | "xs"; description: string; onAdd: () => void }) {
  return <div className="flex flex-col items-center gap-(--primitives-spacing-8)">
    <div className="flex w-full flex-col items-center">
      <div className="relative size-(--primitives-spacing-out-of-scale-30) overflow-hidden"><img src="/payment-methods-empty.png" alt="" className="absolute left-[-19.36%] top-[-16.59%] size-[138.72%] max-w-none" /></div>
      <PageHeader title="No saved payment methods yet" titleAs={titleAs} description={description} className="items-center pt-(--primitives-spacing-8) text-center md:pt-(--primitives-spacing-8) [&_[data-slot=description]]:text-(length:--semantics-typography-body-body-md-font-size) [&_[data-slot=description]]:leading-(--semantics-typography-body-body-md-lh-normal) [&_[data-slot=description]]:tracking-(--semantics-typography-body-body-md-tracking-tight) md:[&_[data-slot=description]]:text-(length:--semantics-typography-body-body-lg-font-size) md:[&_[data-slot=description]]:leading-(--semantics-typography-body-body-lg-lh-normal) md:[&_[data-slot=description]]:tracking-(--semantics-typography-body-body-lg-tracking-tight) [&_[data-slot=title]]:[font-weight:var(--semantics-typography-heading-font-weight)] [&_[data-slot=title]]:text-(length:--semantics-typography-heading-heading-xl-font-size) [&_[data-slot=title]]:leading-(--semantics-typography-heading-heading-xl-lh-tight) [&_[data-slot=title]]:tracking-(--semantics-typography-heading-heading-xl-tracking-tight)" />
    </div>
    <Button variant="outline" size={buttonSize} leadingIcon="plus" onClick={onAdd}>Add new card</Button>
  </div>;
}
