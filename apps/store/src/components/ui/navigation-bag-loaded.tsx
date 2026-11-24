import type * as React from "react";
import { Button, cn, scrollbarClassName } from "@weaveui/ds";
import { BagPreviewProductCard, type BagPreviewProductCardDevice } from "./bag-preview-product-card";
export interface NavigationBagItem {
  name: string;
  src: string;
  alt: string;
  quantity?: string;
}

const BAG_PREVIEW_LIMIT = 5;
const bagHeadingClassName = `m-0 font-sans [font-weight:var(--semantics-typography-heading-font-weight)]
  text-(length:--semantics-typography-heading-heading-xl-font-size)
  leading-(--semantics-typography-heading-heading-xl-lh-tight)
  tracking-(--semantics-typography-heading-heading-xl-tracking-tight)
  [color:var(--semantics-colors-foreground-default)]`;

function bagOverflowLabel(extra: number): string {
  return extra === 1 ? "1 more item in your bag" : `${extra} more items in your bag`;
}

export function NavigationBagLoaded({
  title,
  reviewLabel,
  onReview,
  items,
  device,
  profile,
}: {
  title: string;
  reviewLabel: string;
  onReview?: () => void;
  items: NavigationBagItem[];
  device: BagPreviewProductCardDevice;
  profile: React.ReactNode;
}) {
  const products = items.slice(0, BAG_PREVIEW_LIMIT).map((item, index) => (
    <BagPreviewProductCard
      key={`${item.name}-${index}`}
      device={device}
      name={item.name}
      src={item.src}
      alt={item.alt}
      showQuantity={item.quantity != null}
      quantity={item.quantity}
    />
  ));
  const overflow =
    items.length > BAG_PREVIEW_LIMIT ? (
      <p
        data-slot="navigation-bag-overflow"
        className={`m-0 font-sans
          [font-weight:var(--semantics-typography-body-font-weight)]
          text-(length:--semantics-typography-body-body-md-font-size)
          leading-(--semantics-typography-body-body-md-lh-normal)
          tracking-(--semantics-typography-body-body-md-tracking-tight)
          [color:var(--semantics-colors-foreground-subtle-on-subtlest)]`}
      >
        {bagOverflowLabel(items.length - BAG_PREVIEW_LIMIT)}
      </p>
    ) : null;
  const reviewButton = (
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={onReview}
      className={device === "mobile" ? "w-full" : undefined}
    >
      {reviewLabel}
    </Button>
  );

  if (device === "mobile") {
    return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-start gap-(--primitives-spacing-6)">
        <div className="flex w-full min-w-0 flex-col items-start gap-(--primitives-spacing-6)">
          <h2 data-slot="navigation-bag-title" className={bagHeadingClassName}>
            {title}
          </h2>
          <div
            className={cn(
              "flex min-h-0 w-full flex-1 flex-col items-start gap-(--primitives-spacing-2) overflow-y-auto [scrollbar-gutter:stable]",
              scrollbarClassName,
            )}
          >
            {products}
          </div>
          {overflow}
          {reviewButton}
        </div>
        {profile}
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-(--primitives-spacing-6)">
      <div className="flex w-full min-w-0 flex-col items-start gap-(--primitives-spacing-4)">
        <div className="flex w-full min-w-0 shrink-0 items-center justify-between gap-(--primitives-spacing-4)">
          <h2 data-slot="navigation-bag-title" className={bagHeadingClassName}>
            {title}
          </h2>
          {reviewButton}
        </div>
        <div className="flex w-full flex-col items-start gap-(--primitives-spacing-2)">
          {products}
          {overflow}
        </div>
      </div>
      {profile}
    </div>
  );
}

