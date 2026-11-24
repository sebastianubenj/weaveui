import { Link } from "@weaveui/ds";

const sections = [
  { title: "Learn", links: ["Getting started", "Product setup", "Care & maintenance"] },
  { title: "Support", links: ["FAQs", "Shipping & delivery", "Returns & refunds", "Warranty", "Contact us"] },
  { title: "About", links: ["Our story", "Our philosophy"] },
];

export function HomeFooter() {
  return (
    <footer className="flex justify-center px-(--semantics-layout-mobile-grid-margin) md:px-(--primitives-spacing-8) [background-color:var(--semantics-colors-background-page)]">
      <div className="w-full max-w-(--semantics-layout-desktop-content-max-width) border-t-(length:--primitives-stroke-width-stroke-0-75) [border-color:var(--semantics-colors-border-default)] pt-(--primitives-spacing-8)">
        <div className="mx-auto w-full max-w-(--semantics-layout-desktop-content-max-width-1062)">
          <div className="flex flex-col gap-(--primitives-spacing-4)">
            <img src="/mood-imagotipo.svg" alt="mood." className="self-start" />
            <p className="m-0 font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-lg-font-size) leading-(--semantics-typography-body-body-lg-lh-normal) tracking-(--semantics-typography-body-body-lg-tracking-tight) [color:var(--semantics-colors-foreground-subtle)]">Creative technology for creative minds.</p>
          </div>
          <nav aria-label="Footer" className="mt-(--primitives-spacing-8) flex flex-wrap justify-between gap-y-(--primitives-spacing-8)">
            {sections.map((section) => (
              <section key={section.title} className="w-(--primitives-spacing-32) md:w-auto">
                <h2 className="m-0 font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-label-label-sm-font-size) leading-(--semantics-typography-label-label-sm-lh-snug) tracking-(--semantics-typography-label-label-sm-tracking-0-125) [color:var(--semantics-colors-foreground-subtle-on-subtlest)]">{section.title}</h2>
                <ul className="m-0 mt-(--primitives-spacing-3) flex list-none flex-col items-start gap-(--primitives-spacing-2) p-0">
                  {section.links.map((label) => (
                    <li key={label}>
                      <Link href="#" onClick={(event) => event.preventDefault()} className="inline-block py-(--primitives-spacing-out-of-scale-0-5) font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-md-font-size) leading-(--semantics-typography-body-body-md-lh-normal) tracking-(--semantics-typography-body-body-md-tracking-tight) no-underline hover:underline [color:var(--semantics-colors-foreground-default)]">{label}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
          <div className="mt-(--primitives-spacing-8) border-t-(length:--primitives-stroke-width-stroke-0-75) [border-color:var(--semantics-colors-border-default)] py-(--primitives-spacing-4)">
            <p className="m-0 font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-sm-font-size) leading-(--semantics-typography-body-body-sm-lh-normal) tracking-(--semantics-typography-body-body-sm-tracking-tight) [color:var(--semantics-colors-foreground-subtle)]">© 2026 mood. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
