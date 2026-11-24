import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button, FormAlert, PageHeader } from "@weaveui/ds";
import {
  Navigation,
  NavigationBagTrigger,
  NavigationLink,
  NavigationMenuLink,
  NavigationSearchTrigger,
  NavigationSection,
} from "@weaveui/ds";
import { useAuth } from "@/lib/auth-context";
import { addProductToBag, useBag, useBagUnitCount } from "@/lib/bag";
import { PRODUCTS } from "@/lib/catalog";
import { HomeProducts } from "@/patterns/home-products/home-products";
import { NavigationBagLoaded } from "@/components/ui/navigation-bag-loaded";

interface ProductGroup {
  heading: string;
  productIds: string[];
}

const groups = {
  synths: {
    heading: "Synths & Samplers",
    productIds: ["sp-16", "a01", "gx-24", "sp-40"],
  },
  controllers: {
    heading: "Controllers & Mixers",
    productIds: ["fx-32", "mx-4"],
  },
  recording: {
    heading: "Mics & Recorders",
    productIds: ["mk-20", "fx-mic", "ar-4"],
  },
  speakers: {
    heading: "Speakers",
    productIds: ["sp-12"],
  },
} satisfies Record<string, ProductGroup>;

type HomeMenu = { label: string } & (
  | { groups: ProductGroup[]; links?: never }
  | { links: string[]; groups?: never }
);

const menus: HomeMenu[] = [
  { label: "Products", groups: Object.values(groups) },
  {
    label: "Discover",
    links: ["Creative workflows", "Behind the design"],
  },
  {
    label: "Learn",
    links: ["Getting started", "Product setup", "Care & maintenance"],
  },
  {
    label: "Support",
    links: ["FAQs", "Shipping & delivery", "Returns & refunds", "Warranty", "Contact us"],
  },
  {
    label: "About",
    links: ["Our story", "Our philosophy"],
  },
];

function MenuContent({
  menu,
  onSelect,
}: {
  menu: HomeMenu;
  onSelect: (id: string) => void;
}) {
  const links = menu.links?.map((label) => (
    <NavigationMenuLink
      key={label}
      href="#"
      onClick={(event) => event.preventDefault()}
    >
      {label}
    </NavigationMenuLink>
  ));

  return (
    <>
      <div className="contents md:hidden">
        {menu.groups ? (
          <ProductLinks groups={menu.groups} onSelect={onSelect} mobile />
        ) : (
          <NavigationSection>{links}</NavigationSection>
        )}
      </div>
      <div className="hidden md:contents">
        {menu.groups ? (
          <ProductLinks groups={menu.groups} onSelect={onSelect} />
        ) : (
          <NavigationSection heading={menu.label}>
            {links}
          </NavigationSection>
        )}
      </div>
    </>
  );
}

function ProductLinks({
  groups: sections,
  onSelect,
  mobile = false,
}: {
  groups: ProductGroup[];
  onSelect: (id: string) => void;
  mobile?: boolean;
}) {
  return sections.map((group) => (
    <NavigationSection
      key={group.heading}
      heading={group.heading}
      size={mobile || group.heading === groups.synths.heading ? "lg" : "sm"}
      className={mobile ? "px-0 first:mt-(--primitives-spacing-4) last:mb-(--primitives-spacing-12) [&>h2]:px-(--primitives-spacing-8)" : undefined}
    >
      {group.productIds.flatMap((id) => {
        const product = PRODUCTS.find((candidate) => candidate.id === id);
        return product
          ? [
              <NavigationMenuLink
                key={id}
                href={`#product-${id}`}
                onClick={(event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return;
                  event.preventDefault();
                  onSelect(id);
                }}
              >
                {product.name}
              </NavigationMenuLink>,
            ]
          : [];
      })}
    </NavigationSection>
  ));
}

export interface HomeProps {
  onReview?: () => void;
}

export function Home({ onReview }: HomeProps) {
  const { loggedIn, logOut, error } = useAuth();
  const bagItems = useBag();
  const bagUnitCount = useBagUnitCount();
  const renderLoadedBag = useCallback((device: "desktop" | "mobile", profile: ReactNode) => (
    <NavigationBagLoaded device={device} profile={profile} items={bagItems} title="Bag" reviewLabel="Review bag" onReview={onReview} />
  ), [bagItems, onReview]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const query = search.trim().toLocaleLowerCase();
  const results = query ? PRODUCTS.filter((product) => product.name.toLocaleLowerCase().includes(query)) : [];
  const [destination, setDestination] = useState<{ id: string } | null>(null);

  function selectProduct(id: string) {
    setOpen(false);
    setValue(null);
    setDestination({ id });
  }

  useEffect(() => {
    if (!destination) return;
    const product = document.getElementById(`product-${destination.id}`);
    product?.scrollIntoView({ block: "start" });
    product?.focus({ preventScroll: true });
  }, [destination]);

  return (
    <>
      <Navigation
        logoHref="/"
        logoLabel="Home"
        searchLabel="Search"
        clearSearchLabel="Clear search"
        searchValue={search}
        searchInputRef={searchInputRef}
        onSearchValueChange={setSearch}
        searchResults={results.length > 0 ? (
          <section aria-label="Search results" className="mt-(--primitives-spacing-4) w-full">
            <h2 className="m-0 font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-label-label-sm-font-size) leading-(--semantics-typography-label-label-sm-lh-snug) tracking-(--semantics-typography-label-label-sm-tracking-0-125) [color:var(--semantics-colors-foreground-subtle-on-subtlest)]">Search results</h2>
            <ul className="m-0 mt-(--primitives-spacing-4) flex list-none flex-col gap-(--primitives-spacing-4) p-0">
              {results.map((product) => (
                <li key={product.id}>
                  <a href={`#product-${product.id}`} onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    selectProduct(product.id);
                  }} className="relative flex w-full items-center gap-(--primitives-spacing-2) no-underline [color:var(--semantics-colors-foreground-default)] hover:[background-color:var(--semantics-colors-interaction-secondary-hover)] outline-none after:pointer-events-none after:absolute after:hidden after:content-[''] after:[inset:calc(-1*(var(--primitives-spacing-out-of-scale-0-75)+var(--primitives-ring-focus-width-ring-2)))] after:[border:var(--primitives-ring-focus-width-ring-2)_solid_var(--semantics-colors-border-highlight)] after:[border-radius:var(--primitives-radius-rounded-sm)] focus-visible:after:block">
                    <img src={product.src} alt="" className="size-(--primitives-spacing-12) shrink-0 object-contain [background-color:var(--semantics-colors-background-subtle)]" />
                    <span className="font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-lg-font-size) leading-(--semantics-typography-button-button-lg-lh-snug) tracking-(--semantics-typography-label-label-lg-tracking-0-125)">{product.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : query ? (
          <section aria-live="polite" className="mt-(--primitives-spacing-4) flex w-full flex-col items-center gap-(--primitives-spacing-8) text-center">
            <div className="flex w-full flex-col items-center">
              <div className="relative size-(--primitives-spacing-out-of-scale-30) overflow-hidden">
                <img src="/search-empty.png" alt="" className="absolute top-[-9.49%] left-[-9.49%] size-[118.98%] max-w-none" />
              </div>
              <PageHeader title="No results found" titleAs="h2" description={`We couldn't find any products matching "${search.trim()}".`} className="pt-(--primitives-spacing-8) md:pt-(--primitives-spacing-8) [&_[data-slot=description]]:text-(length:--semantics-typography-body-body-md-font-size) [&_[data-slot=description]]:leading-(--semantics-typography-body-body-md-lh-normal) [&_[data-slot=description]]:tracking-(--semantics-typography-body-body-md-tracking-tight) [&_[data-slot=description]]:[color:var(--semantics-colors-foreground-subtle-on-subtlest)] md:[&_[data-slot=description]]:text-(length:--semantics-typography-body-body-lg-font-size) md:[&_[data-slot=description]]:leading-(--semantics-typography-body-body-lg-lh-normal) md:[&_[data-slot=description]]:tracking-(--semantics-typography-body-body-lg-tracking-tight)" />
              <p className="m-0 mt-(--primitives-spacing-4) font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-md-font-size) leading-(--semantics-typography-body-body-md-lh-normal) tracking-(--semantics-typography-body-body-md-tracking-tight) md:text-(length:--semantics-typography-body-body-lg-font-size) md:leading-(--semantics-typography-body-body-lg-lh-normal) md:tracking-(--semantics-typography-body-body-lg-tracking-tight)">Try a different search term.</p>
            </div>
            <Button variant="outline" size="md" onClick={() => { setSearch(""); searchInputRef.current?.focus(); }}>Clear search</Button>
          </section>
        ) : null}
        menuLabel="Menu"
        closeLabel="Close"
        backLabel="Back"
        open={open}
        onOpenChange={setOpen}
        value={value}
        onValueChange={setValue}
        menu={
          <NavigationSection>
            {menus.map((menu) => (
              <NavigationMenuLink
                key={menu.label}
                href="#products"
                submenu={<MenuContent menu={menu} onSelect={selectProduct} />}
              >
                {menu.label}
              </NavigationMenuLink>
            ))}
          </NavigationSection>
        }
      >
        {menus.map((menu) => (
          <NavigationLink
            key={menu.label}
            value={menu.label.toLowerCase()}
            href="#products"
            menu={<MenuContent menu={menu} onSelect={selectProduct} />}
            menuLabel={`${menu.label} menu`}
          >
            {menu.label}
          </NavigationLink>
        ))}
        <NavigationSearchTrigger />
        <NavigationBagTrigger
          aria-label="Bag"
          signInHref="/login"
          loggedIn={loggedIn}
          onLogOut={() => {
            void logOut();
          }}
          unitCount={bagUnitCount}
          renderLoadedBag={renderLoadedBag}
        />
      </Navigation>
      <main>
        {error ? (
          <FormAlert className="px-(--semantics-layout-mobile-grid-margin) md:px-(--semantics-layout-desktop-grid-margin)">
            {error}
          </FormAlert>
        ) : null}
        <HomeProducts onAction={addProductToBag} />
      </main>
    </>
  );
}
