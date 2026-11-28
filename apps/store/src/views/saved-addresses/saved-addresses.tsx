import { useState, type FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ValidationForm } from "@/components/form-validation";
import { Menu } from "@base-ui/react/menu";
import { Button, Checkbox, Field, Icon, PageHeader, Select, SelectContent, SelectItem, iconBox16 } from "@weaveui/ds";
import { AddressEmptyState } from "@/components/address/address-empty-state";
import { AddressFields } from "@/components/address/address-fields";
import { useAddresses, type Address } from "@/lib/addresses-context";
import { useViewNavigation } from "@/lib/view-navigation";

const heading = "m-0 font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-sm-font-size) leading-(--semantics-typography-heading-heading-sm-lh-tight) tracking-(--semantics-typography-heading-heading-sm-tracking-tight)";
const labelLarge = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-lg-font-size) leading-(--semantics-typography-button-button-lg-lh-snug) tracking-(--semantics-typography-label-label-lg-tracking-0-125)";
const label = "font-sans [font-weight:var(--semantics-typography-label-font-weight)] text-(length:--semantics-typography-label-label-md-font-size) leading-(--semantics-typography-label-label-md-lh-snug) tracking-(--semantics-typography-label-label-md-tracking-0-125)";
const body = "font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-md-font-size) leading-(--semantics-typography-body-body-md-lh-normal) tracking-(--semantics-typography-body-body-md-tracking-tight)";
const menuItem = "flex w-full items-center rounded-(--primitives-radius-rounded-10) px-(--primitives-spacing-2) py-(--primitives-spacing-out-of-scale-2-5) font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-lg-font-size) leading-(--semantics-typography-body-body-lg-lh-normal) tracking-(--semantics-typography-body-body-lg-tracking-tight) outline-none data-[highlighted]:[background-color:var(--semantics-colors-background-subtle)] data-[disabled]:opacity-(--primitives-opacity-opacity-50)";

function DefaultBadge() { return <span data-badge className="rounded-(--primitives-radius-rounded-sm) border-(length:--primitives-stroke-width-stroke) [border-color:var(--semantics-colors-border-highlight)] [background-color:var(--semantics-colors-background-info-op10)] px-(--primitives-spacing-1) font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-sm-font-size) leading-(--semantics-typography-body-body-sm-lh-normal) tracking-(--semantics-typography-body-body-sm-tracking-tight) [color:var(--semantics-colors-foreground-highlight)]">Default</span>; }

function AddressMenu({ name, isDefault, onSetDefault, onEdit, onDelete }: { name: string; isDefault: boolean; onSetDefault: () => void; onEdit: () => void; onDelete: () => void }) {
  return <Menu.Root>
    <Menu.Trigger render={<Button variant="ghost" surface={isDefault ? "on-subtle" : "default"} size="icon-xs" icon="ellipsis-vertical" aria-label={`Options for ${name}`} />} />
    <Menu.Portal>
      <Menu.Positioner side="bottom" sideOffset={4} align="end" className="z-(--semantics-layer-popover) outline-none">
        <Menu.Popup className="w-(--primitives-spacing-out-of-scale-40) rounded-(--primitives-radius-rounded-14) [background-color:var(--semantics-colors-background-default)] p-(--primitives-spacing-1) [box-shadow:var(--effect-shadows-popover-0),var(--effect-shadows-popover-1)] outline-none">
          {!isDefault && <Menu.Item onClick={onSetDefault} className={`${menuItem} cursor-pointer [color:var(--semantics-colors-foreground-default)]`}>Set as default</Menu.Item>}
          <Menu.Item onClick={onEdit} className={`${menuItem} cursor-pointer [color:var(--semantics-colors-foreground-default)]`}>Edit address</Menu.Item>
          <Menu.Item onClick={onDelete} className={`${menuItem} cursor-pointer [color:var(--semantics-colors-foreground-destructive)]`}>Delete</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>;
}

export function SavedAddresses() {
  const { addresses, defaultAddressId, addAddress, updateAddress, deleteAddress, setDefaultAddressId } = useAddresses();
  const { pathname, open, back } = useViewNavigation("/saved-addresses");
  const adding = pathname === "/saved-addresses/new";
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replacementId, setReplacementId] = useState<string | null>(null);
  const deleting = addresses.find(address => address.id === deletingId);
  const remaining = addresses.filter(address => address.id !== deletingId);
  const deletingDefault = deleting?.id === defaultAddressId;
  const needsReplacement = deletingDefault && remaining.length > 1;
  const editingId = pathname.match(/^\/saved-addresses\/([^/]+)\/edit$/)?.[1];
  const editing = addresses.find(address => address.id === editingId);
  const editingDefault = editing?.id === defaultAddressId;
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (key: string) => String(fields.get(key) ?? "").trim();
    const address = { id: editing?.id ?? crypto.randomUUID(), first: value("saved-first"), last: value("saved-last"), street: value("saved-street"), line2: value("saved-line2"), city: value("saved-city"), state: value("saved-state"), zip: value("saved-zip"), name: value("saved-name") };
    if (editing) updateAddress(address, editingDefault || fields.has("saved-default"));
    else addAddress(address, fields.has("saved-default"));
    back();
  }
  return <div className="mx-auto w-full max-w-(--semantics-layout-desktop-content-max-width-658) px-(--semantics-layout-mobile-grid-margin) pb-(--primitives-spacing-32) md:px-0">
    <PageHeader title="Saved addresses" titleAs="h1" description={addresses.length > 0 || adding || editing ? "Manage your saved shipping addresses." : undefined} className="py-(--primitives-spacing-4) md:[&_[data-slot=title]]:[font-weight:var(--semantics-typography-heading-font-weight)] md:[&_[data-slot=title]]:text-(length:--semantics-typography-heading-heading-xl-font-size) md:[&_[data-slot=title]]:leading-(--semantics-typography-heading-heading-xl-lh-tight) md:[&_[data-slot=title]]:tracking-(--semantics-typography-heading-heading-xl-tracking-tight)" />
    {!adding && !editing && addresses.length === 0 ? <div className="pt-(--primitives-spacing-4)"><AddressEmptyState titleAs="h2" buttonSize="lg" description="Add a shipping address to make your next checkout faster." onAdd={() => open("/saved-addresses/new")} /></div> : adding || editing ? <section aria-labelledby="address-form-heading"><div className="flex items-center gap-(--primitives-spacing-1)"><h2 id="address-form-heading" className={heading}>{editing ? "Edit address" : "Add new address"}</h2>{editingDefault && <DefaultBadge />}</div>
      <ValidationForm className="mt-(--primitives-spacing-2) flex flex-col gap-(--primitives-spacing-8)" onSubmit={save}>
        <div className="flex flex-col gap-(--primitives-spacing-4)"><div className="grid gap-(--primitives-spacing-4) md:grid-cols-2">
          <AddressFields prefix="saved" contact values={editing} />
        </div>{addresses.length > 0 && !editingDefault && <Checkbox name="saved-default"><span className={body}>Set as default shipping address</span></Checkbox>}</div>
        <div className="flex gap-(--primitives-spacing-4) md:justify-end"><Button type="button" variant="outline" size="lg" className="flex-1 md:flex-none" onClick={() => back()}>Cancel</Button><Button type="submit" size="lg" className="flex-1 md:flex-none">{editing ? "Save changes" : "Save address"}</Button></div>
      </ValidationForm>
    </section> : <section aria-labelledby="your-addresses-heading"><h2 id="your-addresses-heading" className={heading}>Your addresses</h2>
      <div className="mt-(--primitives-spacing-2) grid gap-(--primitives-spacing-4) md:grid-cols-2">{addresses.map(address => {
        const isDefault = address.id === defaultAddressId;
        return <article key={address.id} className={`rounded-(--primitives-radius-rounded-14) border-(length:--primitives-stroke-width-stroke) p-(--primitives-spacing-3) ${isDefault ? "[background-color:var(--semantics-colors-background-subtle)] [border-color:var(--semantics-colors-border-transparent)]" : "[background-color:var(--semantics-colors-background-default)] [border-color:var(--semantics-colors-border-default)]"}`}>
          <div className="flex items-center justify-between gap-(--primitives-spacing-2)"><div className="flex min-w-0 items-center gap-(--primitives-spacing-1)"><h3 className={`${labelLarge} m-0 truncate`}>{address.name}</h3>{isDefault && <DefaultBadge />}</div><AddressMenu name={address.name} isDefault={isDefault} onSetDefault={() => setDefaultAddressId(address.id)} onEdit={() => open(`/saved-addresses/${encodeURIComponent(address.id)}/edit`)} onDelete={() => { setReplacementId(null); setDeletingId(address.id); }} /></div>
          <div className={`${body} mt-(--primitives-spacing-2)`}><div className={label}>{address.first} {address.last}</div><div className="[color:var(--semantics-colors-foreground-subtle-on-subtle)]">{address.street}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.zip}</div></div>
        </article>;
      })}</div>
      <div className="mt-(--primitives-spacing-4) flex justify-center"><button type="button" onClick={() => open("/saved-addresses/new")} className="inline-flex cursor-pointer items-center gap-(--primitives-spacing-1) rounded-(--primitives-radius-rounded-sm) border-0 bg-transparent p-0 font-sans [font-weight:var(--semantics-typography-button-font-weight)] text-(length:--semantics-typography-button-button-md-font-size) leading-(--semantics-typography-button-button-md-lh-snug) tracking-(--semantics-typography-button-tracking-normal) underline [color:var(--semantics-colors-foreground-highlight)] focus-visible:[outline:var(--primitives-ring-focus-width-ring-2)_solid_var(--semantics-colors-border-highlight)]"><Icon name="plus" size={iconBox16} aria-hidden="true" />Add new address</button></div>
    </section>}
    {deleting && <Dialog.Root open onOpenChange={open => { if (!open) setDeletingId(null); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--semantics-layer-popover) [background-color:var(--semantics-colors-background-subtle-op60)] [backdrop-filter:blur(var(--semantics-background-blur-bg-blur-16-css))]" />
        <Dialog.Viewport className="fixed inset-0 z-(--semantics-layer-popover) flex items-center justify-center overflow-y-auto p-(--semantics-layout-mobile-grid-margin)">
          <Dialog.Popup className="w-full max-w-[31.25rem] rounded-(--primitives-radius-rounded-3xl) [background-color:var(--semantics-colors-background-default)] p-(--primitives-spacing-4) outline-none">
            <div className="flex flex-col gap-(--primitives-spacing-4)">
              <div className="flex flex-col gap-(--primitives-spacing-1)">
                <Dialog.Title className="m-0 text-center font-sans [font-weight:var(--semantics-typography-heading-font-weight)] text-(length:--semantics-typography-heading-heading-xl-font-size) leading-(--semantics-typography-heading-heading-xl-lh-tight) tracking-(--semantics-typography-heading-heading-xl-tracking-tight)">{deletingDefault && remaining.length ? "Delete default address?" : "Delete address?"}</Dialog.Title>
                <Dialog.Description className="m-0 text-center [color:var(--semantics-colors-foreground-subtle)] font-sans [font-weight:var(--semantics-typography-body-font-weight)] text-(length:--semantics-typography-body-body-lg-font-size) leading-(--semantics-typography-body-body-lg-lh-normal) tracking-(--semantics-typography-body-body-lg-tracking-tight)">{needsReplacement ? "Select a new default shipping address before deleting this one." : deletingDefault && remaining.length === 1 ? <><span className={labelLarge}>{remaining[0].name}</span> will become your new default shipping address.</> : "Are you sure you want to delete this address from your saved addresses?"}</Dialog.Description>
              </div>
              <div className="mx-auto w-full md:max-w-[22.375rem] rounded-(--primitives-radius-rounded-14) border-(length:--primitives-stroke-width-stroke) [border-color:var(--semantics-colors-border-transparent)] [background-color:var(--semantics-colors-background-subtle)] p-(--primitives-spacing-3)">
                <div className="flex items-center gap-(--primitives-spacing-1)"><span className={labelLarge}>{deleting.name}</span>{deletingDefault && <DefaultBadge />}</div>
                <div className={`${body} mt-(--primitives-spacing-2)`}><div className={label}>{deleting.first} {deleting.last}</div><div className="[color:var(--semantics-colors-foreground-subtle-on-subtle)]">{deleting.street}{deleting.line2 ? `, ${deleting.line2}` : ""}<br />{deleting.city}, {deleting.state} {deleting.zip}</div></div>
              </div>
              {needsReplacement && <div className="mx-auto w-full md:max-w-[22.375rem]"><Field label="New default address" htmlFor="replacement-address"><Select id="replacement-address" value={replacementId} onValueChange={setReplacementId} placeholder="Select an address"><SelectContent>{remaining.map((address: Address) => <SelectItem key={address.id} value={address.id}>{address.name} – {address.street}{address.line2 ? `, ${address.line2}` : ""}</SelectItem>)}</SelectContent></Select></Field></div>}
            </div>
            <div className="mt-(--primitives-spacing-8) flex flex-col gap-(--primitives-spacing-4) md:hidden">
              <Button variant="destructive" size="lg" className="w-full" disabled={Boolean(needsReplacement && !replacementId)} onClick={() => { deleteAddress(deleting.id, replacementId ?? undefined); setDeletingId(null); }}>Delete address</Button>
              <Dialog.Close render={<Button variant="outline" size="lg" className="w-full" />}>Cancel</Dialog.Close>
            </div>
            <div className="mt-(--primitives-spacing-8) hidden gap-(--primitives-spacing-4) md:flex">
              <Dialog.Close render={<Button variant="outline" size="lg" className="flex-1" />}>Cancel</Dialog.Close>
              <Button variant="destructive" size="lg" className="flex-1" disabled={Boolean(needsReplacement && !replacementId)} onClick={() => { deleteAddress(deleting.id, replacementId ?? undefined); setDeletingId(null); }}>Delete address</Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>}
  </div>;
}
