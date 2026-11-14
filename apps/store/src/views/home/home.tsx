import { useEffect, useState } from "react";
import { FormAlert } from "@weaveui/ds";
import {
  Navigation,
  NavigationBagTrigger,
  NavigationLink,
  NavigationMenuLink,
  NavigationSearchTrigger,
  NavigationSection,
} from "@/components/ui/navigation";
import { useAuth } from "@/lib/auth-context";
import { addProductToBag, useBag } from "@/lib/bag";
import { PRODUCTS } from "@/lib/catalog";
import { HomeProducts } from "@/patterns/home-products/home-products";

interface ProductGroup {
  heading: string;
  productIds: string[];
}

const groups = {
  synthesizers: {
    heading: "Synthesizers",
    productIds: ["op-1-field", "op-xy"],
  },
  samplers: { heading: "Samplers", productIds: ["ep-40", "ko-ii-fx-mic"] },
  recording: {
    heading: "Recording & Mixing",
    productIds: ["tp-7", "cm-15", "tx-6"],
  },
  accessories: {
    heading: "Accessories & Audio",
    productIds: ["ep-2350", "ko-pedal", "life-is-fantastic"],
  },
} satisfies Record<string, ProductGroup>;

type HomeMenu = { label: string } & (
  | { groups: ProductGroup[]; links?: never }
  | { links: string[]; groups?: never }
);

const menus: HomeMenu[] = [
  { label: "Products", groups: Object.values(groups) },
  { label: "Services", links: ["Repairs", "Maintenance", "Customization"] },
  {
    label: "Discover",
    links: ["Collections", "Collaborations", "Stories", "Artists"],
  },
  {
    label: "Support",
    links: ["Help Center", "Orders & Shipping", "Product Resources"],
  },
  {
    label: "About",
    links: ["Our Story", "Design Philosophy", "Careers", "Contact"],
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
          <NavigationSection heading={`Explore ${menu.label}`}>
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
      heading={
        mobile && group.heading === groups.synthesizers.heading
          ? undefined
          : group.heading
      }
      size={group.heading === groups.synthesizers.heading ? "lg" : "sm"}
      className={mobile ? "[&>h2]:pl-(--primitives-spacing-8)" : undefined}
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
                className={mobile ? "pl-(--primitives-spacing-8)" : undefined}
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
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
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
          items={bagItems}
          onReview={onReview}
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
