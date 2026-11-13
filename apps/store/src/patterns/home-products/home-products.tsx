import * as React from "react";

import { ProductCard } from "@/components/ui/product-card";
import { cn, useIsDesktop } from "@weaveui/ds";
import { PRODUCTS, type HomeProduct } from "@/lib/catalog";

const headingClassName = `m-0 w-full scroll-mt-(--primitives-spacing-20) font-sans
  [font-weight:var(--semantics-typography-heading-font-weight)]
  text-(length:--semantics-typography-heading-heading-xl-font-size)
  leading-(--semantics-typography-heading-heading-xl-lh-tight)
  tracking-(--semantics-typography-heading-heading-xl-tracking-tight)
  [color:var(--semantics-colors-foreground-default)]`;

export type { HomeProduct } from "@/lib/catalog";

export interface HomeProductsProps {
  onAction?: (
    product: HomeProduct,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}

export function HomeProducts({ onAction }: HomeProductsProps) {
  const isDesktop = useIsDesktop();

  return (
    <div
      className="flex min-h-dvh w-full flex-col items-center px-(--semantics-layout-mobile-grid-margin) md:px-(--semantics-layout-desktop-grid-margin) [background-color:var(--semantics-colors-background-page)]"
    >
      <div className="flex w-full max-w-(--semantics-layout-desktop-content-max-width) flex-col items-start pb-(--primitives-spacing-32)">
        <div className="flex w-full items-start py-(--primitives-spacing-4)">
          <h1 id="products" className={headingClassName}>All products</h1>
        </div>
        <div
          className="grid w-full grid-cols-1 gap-(--primitives-spacing-6) md:grid-cols-4 md:gap-x-(--semantics-layout-desktop-grid-gutter) md:gap-y-(--primitives-spacing-10)"
        >
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              id={`product-${product.id}`}
              aria-label={product.name}
              tabIndex={-1}
              className={cn(
                "scroll-mt-(--primitives-spacing-20) outline-none focus-visible:[outline:var(--primitives-ring-focus-width-ring-2)_solid_var(--semantics-colors-border-ring-focus)] focus-visible:[outline-offset:var(--primitives-spacing-out-of-scale-0-75)]",
                product.layout === "horizontal" && "md:col-span-2",
              )}
              layout={isDesktop ? product.layout : "square"}
              name={product.name}
              price={product.price}
              src={product.src}
              alt={product.alt}
              onAction={
                onAction
                  ? (event) => onAction(product, event)
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
