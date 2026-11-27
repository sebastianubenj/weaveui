import { useState, type FormEvent } from "react";
import { Menu } from "@base-ui/react/menu";
import { Button, Checkbox, Field, Icon, Input, PageHeader, Select, SelectContent, SelectItem, iconBox16 } from "@weaveui/ds";
import { useAddresses } from "@/lib/addresses-context";

const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const heading = "m-0 font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-sm-font-size) leading-(--semantics-typography-heading-heading-sm-lh-tight) tracking-(--semantics-typography-heading-heading-sm-tracking-tight)";
const labelLarge = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-lg-font-size) leading-(--semantics-typography-button-button-lg-lh-snug) tracking-(--semantics-typography-label-label-lg-tracking-0-125)";
const label = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-md-font-size) leading-(--semantics-typography-label-label-md-lh-snug) tracking-(--semantics-typography-label-label-md-tracking-0-125)";
const body = "font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-md-font-size) leading-(--semantics-typography-body-body-md-lh-normal) tracking-(--semantics-typography-body-body-md-tracking-tight)";
const menuItem = "flex w-full items-center rounded-(--primitives-radius-rounded-10) px-(--primitives-spacing-2) py-(--primitives-spacing-out-of-scale-2-5) font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-lg-font-size) leading-(--semantics-typography-body-body-lg-lh-normal) tracking-(--semantics-typography-body-body-lg-tracking-tight) outline-none data-[highlighted]:[background-color:var(--semantics-colors-background-subtle)] data-[disabled]:opacity-(--primitives-opacity-opacity-50)";

function AddressMenu({ name, isDefault, onSetDefault, onEdit }: { name: string; isDefault: boolean; onSetDefault: () => void; onEdit: () => void }) {
  return <Menu.Root>
    <Menu.Trigger render={<Button variant="ghost" size="icon-xs" icon="ellipsis-vertical" aria-label={`Options for ${name}`} />} />
    <Menu.Portal>
      <Menu.Positioner side="bottom" sideOffset={4} align="end" className="z-(--semantics-layer-popover) outline-none">
        <Menu.Popup className="w-(--primitives-spacing-out-of-scale-40) rounded-(--primitives-radius-rounded-14) [background-color:var(--semantics-colors-background-default)] p-(--primitives-spacing-1) [box-shadow:var(--effect-shadows-popover-0),var(--effect-shadows-popover-1)] outline-none">
          <Menu.Item onClick={onEdit} className={`${menuItem} cursor-pointer [color:var(--semantics-colors-foreground-default)]`}>Edit</Menu.Item>
          {!isDefault && <Menu.Item onClick={onSetDefault} className={`${menuItem} cursor-pointer [color:var(--semantics-colors-foreground-default)]`}>Set as default</Menu.Item>}
          <Menu.Item disabled className={`${menuItem} [color:var(--semantics-colors-foreground-destructive)]`}>Delete</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>;
}

function AddressInput({ id, label: text, placeholder, autoComplete, optional = false, zip = false, defaultValue }: { id: string; label: string; placeholder: string; autoComplete?: string; optional?: boolean; zip?: boolean; defaultValue?: string }) {
  return <Field label={text} htmlFor={id} optional={optional}><Input id={id} name={id} defaultValue={defaultValue} placeholder={placeholder} autoComplete={autoComplete} required={!optional} inputMode={zip ? "numeric" : undefined} pattern={zip ? "[0-9]{5}(-[0-9]{4})?" : undefined} title={zip ? "Enter a 5-digit ZIP code or ZIP+4." : undefined} /></Field>;
}

export function SavedAddresses() {
  const { addresses, defaultAddressId, addAddress, updateAddress, setDefaultAddressId } = useAddresses();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = addresses.find(address => address.id === editingId);
  const editingDefault = editing?.id === defaultAddressId;
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (key: string) => String(fields.get(key) ?? "").trim();
    const address = { id: editing?.id ?? crypto.randomUUID(), first: value("saved-first"), last: value("saved-last"), street: value("saved-street"), line2: value("saved-line2"), city: value("saved-city"), state: value("saved-state"), zip: value("saved-zip"), name: value("saved-name") };
    if (editing) updateAddress(address, editingDefault || fields.has("saved-default"));
    else addAddress(address, fields.has("saved-default"));
    setAdding(false);
    setEditingId(null);
  }
  return <div className="mx-auto w-full max-w-(--semantics-layout-desktop-content-max-width-658) px-(--semantics-layout-mobile-grid-margin) pb-(--primitives-spacing-32) md:px-0">
    <PageHeader title="Saved addresses" titleAs="h1" description="Manage your saved shipping addresses." className="py-(--primitives-spacing-4) md:[&_[data-slot=title]]:[font-weight:var(--semantics-typography-heading-font-weight)] md:[&_[data-slot=title]]:text-(length:--semantics-typography-heading-heading-xl-font-size) md:[&_[data-slot=title]]:leading-(--semantics-typography-heading-heading-xl-lh-tight) md:[&_[data-slot=title]]:tracking-(--semantics-typography-heading-heading-xl-tracking-tight)" />
    {adding || editing ? <section aria-labelledby="address-form-heading"><h2 id="address-form-heading" className={heading}>{editing ? "Edit address" : "Add new address"}</h2>
      <form className="mt-(--primitives-spacing-2) flex flex-col gap-(--primitives-spacing-8)" onSubmit={save}>
        <div className="flex flex-col gap-(--primitives-spacing-4)"><div className="grid gap-(--primitives-spacing-4) md:grid-cols-2">
          <AddressInput defaultValue={editing?.first} id="saved-first" label="First name" placeholder="Enter your first name" autoComplete="given-name" />
          <AddressInput defaultValue={editing?.last} id="saved-last" label="Last name" placeholder="Enter your last name" autoComplete="family-name" />
          <AddressInput defaultValue={editing?.street} id="saved-street" label="Street address" placeholder="Enter your street address" autoComplete="address-line1" />
          <AddressInput defaultValue={editing?.line2} id="saved-line2" label="Address line 2" placeholder="e.g. Apt 4B" autoComplete="address-line2" optional />
          <AddressInput defaultValue={editing?.city} id="saved-city" label="City" placeholder="Enter your city" autoComplete="address-level2" />
          <Field label="State" htmlFor="saved-state"><Select id="saved-state" name="saved-state" defaultValue={editing?.state} placeholder="Select an option" required><SelectContent>{states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select></Field>
          <AddressInput defaultValue={editing?.zip} id="saved-zip" label="ZIP code" placeholder="Enter your ZIP code" autoComplete="postal-code" zip />
          <AddressInput defaultValue={editing?.name} id="saved-name" label="Address name" placeholder="e.g. Home, Work" />
        </div><Checkbox name="saved-default" defaultChecked={editing ? editingDefault : true} disabled={editingDefault}><span className={body}>Set as default shipping address</span></Checkbox></div>
        <div className="flex gap-(--primitives-spacing-4) md:justify-end"><Button type="button" variant="outline" size="lg" className="flex-1 md:flex-none" onClick={() => { setAdding(false); setEditingId(null); }}>Cancel</Button><Button type="submit" size="lg" className="flex-1 md:flex-none">{editing ? "Save changes" : "Save address"}</Button></div>
      </form>
    </section> : <section aria-labelledby="your-addresses-heading"><h2 id="your-addresses-heading" className={heading}>Your addresses</h2>
      <div className="mt-(--primitives-spacing-2) grid gap-(--primitives-spacing-4) md:grid-cols-2">{addresses.map(address => {
        const isDefault = address.id === defaultAddressId;
        return <article key={address.id} className={`rounded-(--primitives-radius-rounded-14) border-(length:--primitives-stroke-width-stroke) p-(--primitives-spacing-3) ${isDefault ? "[background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]" : "[background-color:var(--semantics-colors-background-default)] [border-color:var(--semantics-colors-border-default)]"}`}>
          <div className="flex items-center justify-between gap-(--primitives-spacing-2)"><div className="flex min-w-0 items-center gap-(--primitives-spacing-1)"><h3 className={`${labelLarge} m-0 truncate`}>{address.name}</h3>{isDefault && <span data-badge className="rounded-(--primitives-radius-rounded-sm) border-(length:--primitives-stroke-width-stroke) [border-color:var(--semantics-colors-border-highlight)] [background-color:var(--semantics-colors-background-info-op10)] px-(--primitives-spacing-1) font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-sm-font-size) leading-(--semantics-typography-body-body-sm-lh-normal) tracking-(--semantics-typography-body-body-sm-tracking-tight) [color:var(--semantics-colors-foreground-highlight)]">Default</span>}</div><AddressMenu name={address.name} isDefault={isDefault} onSetDefault={() => setDefaultAddressId(address.id)} onEdit={() => setEditingId(address.id)} /></div>
          <div className={`${body} mt-(--primitives-spacing-2)`}><div className={label}>{address.first} {address.last}</div><div className="[color:var(--semantics-colors-foreground-subtle-on-subtle)]">{address.street}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.zip}</div></div>
        </article>;
      })}</div>
      <div className="mt-(--primitives-spacing-4) flex justify-center"><button type="button" onClick={() => setAdding(true)} className="inline-flex cursor-pointer items-center gap-(--primitives-spacing-1) rounded-(--primitives-radius-rounded-sm) border-0 bg-transparent p-0 font-sans [font-weight:var(--semantics-typography-button-font-weight)] text-(length:--semantics-typography-button-button-md-font-size) leading-(--semantics-typography-button-button-md-lh-snug) tracking-(--semantics-typography-button-tracking-normal) underline [color:var(--semantics-colors-foreground-highlight)] focus-visible:[outline:var(--primitives-ring-focus-width-ring-2)_solid_var(--semantics-colors-border-highlight)]"><Icon name="plus" size={iconBox16} aria-hidden="true" />Add new address</button></div>
    </section>}
  </div>;
}
