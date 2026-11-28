import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AddressesProvider } from "@/lib/addresses-provider";
import { PaymentMethodsProvider } from "@/lib/payment-methods-provider";
import { PaymentMethods } from "./payment-methods";

const meta = {
  title: "Views/Payment methods",
  component: PaymentMethods,
  parameters: { layout: "fullscreen" },
  decorators: [Story => <MemoryRouter initialEntries={["/payment-methods"]}><AddressesProvider><PaymentMethodsProvider><Story /></PaymentMethodsProvider></AddressesProvider></MemoryRouter>],
} satisfies Meta<typeof PaymentMethods>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
export const AddCard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Add new card" }));
    await expect(canvas.getByRole("checkbox", { name: "Set as default payment method" })).not.toBeChecked();
    const useShipping = canvas.getByRole("checkbox", { name: "Use default shipping address as billing address" });
    await expect(useShipping).toBeChecked();
    await expect(canvas.getByText("123 Main Street, Apt 4B")).toBeVisible();
    await userEvent.click(useShipping);
    await expect(canvas.getByLabelText("Street address")).toBeVisible();
    await userEvent.type(canvas.getByLabelText("Street address"), "100 Billing Road");
    await userEvent.type(canvas.getByLabelText("City"), "New York");
    await userEvent.click(canvas.getByRole("combobox", { name: "State" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "NY" }));
    await userEvent.type(canvas.getByLabelText("ZIP code"), "10001");
    await userEvent.type(canvas.getByLabelText("Cardholder name"), "Alex Doe");
    await userEvent.type(canvas.getByLabelText("Card number"), "5555555555554444");
    await userEvent.type(canvas.getByLabelText("Expiration date"), "1230");
    await userEvent.type(canvas.getByLabelText("Security code"), "123");
    await userEvent.click(canvas.getByRole("button", { name: "Save card" }));
    const card = canvas.getByText("Mastercard ····4444").closest("article")!;
    await expect(within(card).getByText("100 Billing Road")).toBeVisible();
    await expect(within(card).queryByText("Default")).not.toBeInTheDocument();
    const original = canvas.getByText("Visa ····4242").closest("article")!;
    await expect(within(original).getByText("Default")).toBeVisible();
  },
};
export const EditBillingAddress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Options for Visa ending in 4242" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit billing address" }));
    await expect(canvas.getByRole("heading", { name: "Edit billing address" })).toBeVisible();
    await expect(canvas.getByLabelText("Street address")).toHaveValue("456 Main Street");
    await expect(canvas.queryByLabelText("Card number")).toBeNull();
    await expect(canvas.queryByRole("checkbox")).toBeNull();
    await userEvent.clear(canvas.getByLabelText("Street address"));
    await userEvent.type(canvas.getByLabelText("Street address"), "999 Billing Road");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByText("456 Main Street, Apt 8C")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Options for Visa ending in 4242" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit billing address" }));
    await userEvent.clear(canvas.getByLabelText("Street address"));
    await userEvent.type(canvas.getByLabelText("Street address"), "999 Billing Road");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getByText("999 Billing Road, Apt 8C")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Options for Mastercard ending in 3737" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Set as default" }));
    const mastercard = canvas.getByText("Mastercard ····3737").closest("article")!;
    await expect(within(mastercard).getByText("Default")).toBeVisible();
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  },
};
export const EditBillingAddressMobile: Story = { ...EditBillingAddress, globals: { viewport: { value: "mobile1", isRotated: false } } };

export const ContextMenus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const body = within(document.body);
    const defaultTrigger = canvas.getByRole("button", { name: "Options for Visa ending in 4242" });
    defaultTrigger.focus();
    await userEvent.keyboard("{Enter}");
    let menu = await body.findByRole("menu");
    await expect(within(menu).getAllByRole("menuitem").map(item => item.textContent)).toEqual(["Edit billing address", "Delete"]);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: "Options for Mastercard ending in 3737" }));
    menu = await body.findByRole("menu");
    await expect(within(menu).getAllByRole("menuitem").map(item => item.textContent)).toEqual(["Set as default", "Edit billing address", "Delete"]);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  },
};
export const ContextMenusMobile: Story = { ...ContextMenus, globals: { viewport: { value: "mobile1", isRotated: false } } };

export const DeleteCards: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const body = within(document.body);
    async function openDelete(name: string) {
      await userEvent.click(canvas.getByRole("button", { name: `Options for ${name}` }));
      await userEvent.click(await body.findByRole("menuitem", { name: "Delete" }));
      return within(await body.findByRole("dialog"));
    }
    let dialog = await openDelete("Mastercard ending in 3737");
    await expect(dialog.getByRole("heading", { name: "Delete card?" })).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByText("Mastercard ····3737")).toBeVisible();
    dialog = await openDelete("Visa ending in 4242");
    await expect(body.getByRole("dialog")).toHaveAccessibleDescription("Mastercard ····3737 will become your new default payment method.");
    await userEvent.click(dialog.getByRole("button", { name: "Delete card" }));
    const remaining = canvas.getByText("Mastercard ····3737").closest("article")!;
    await expect(within(remaining).getByText("Default")).toBeVisible();
    dialog = await openDelete("Mastercard ending in 3737");
    await expect(dialog.getByRole("heading", { name: "Delete card?" })).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Delete card" }));
    await expect(canvas.queryByText("Mastercard ····3737")).not.toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "No saved payment methods yet" })).toBeVisible();
    await expect(canvas.getByText("Add a payment method to make your next checkout faster.")).toBeVisible();
    await expect(canvas.queryByText("Manage your saved payment methods.")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Add new card" }));
    await expect(canvas.queryByRole("checkbox", { name: "Set as default payment method" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("heading", { name: "No saved payment methods yet" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add new card" }));
    await userEvent.type(canvas.getByLabelText("Cardholder name"), "Alex Doe");
    await userEvent.type(canvas.getByLabelText("Card number"), "5555555555554444");
    await userEvent.type(canvas.getByLabelText("Expiration date"), "1230");
    await userEvent.type(canvas.getByLabelText("Security code"), "123");
    await userEvent.click(canvas.getByRole("button", { name: "Save card" }));
    await expect(within(canvas.getByText("Mastercard ····4444").closest("article")!).getByText("Default")).toBeVisible();
  },
};
export const DeleteCardsMobile: Story = { ...DeleteCards, globals: { viewport: { value: "mobile1", isRotated: false } } };

export const DeleteNonDefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Options for Mastercard ending in 3737" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Delete" }));
    await userEvent.click(within(await body.findByRole("dialog")).getByRole("button", { name: "Delete card" }));
    await expect(canvas.queryByText("Mastercard ····3737")).not.toBeInTheDocument();
    await expect(within(canvas.getByText("Visa ····4242").closest("article")!).getByText("Default")).toBeVisible();
  },
};

export const DeleteDefaultWithChoice: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Add new card" }));
    await userEvent.type(canvas.getByLabelText("Cardholder name"), "Alex Doe");
    await userEvent.type(canvas.getByLabelText("Card number"), "5555555555554444");
    await userEvent.type(canvas.getByLabelText("Expiration date"), "1230");
    await userEvent.type(canvas.getByLabelText("Security code"), "123");
    await userEvent.click(canvas.getByRole("button", { name: "Save card" }));
    await userEvent.click(canvas.getByRole("button", { name: "Options for Visa ending in 4242" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Delete" }));
    const dialog = within(await body.findByRole("dialog"));
    const submit = dialog.getByRole("button", { name: "Delete card" });
    await expect(submit).toBeDisabled();
    const select = dialog.getByRole("combobox", { name: "New default card" });
    await userEvent.click(select);
    await expect(await body.findByRole("option", { name: "Mastercard – ····3737" })).toBeVisible();
    const popup = body.getByRole("listbox").closest('[data-slot="select-content"]')!;
    await expect(Math.abs(popup.getBoundingClientRect().width - select.getBoundingClientRect().width)).toBeLessThan(1);
    await userEvent.click(await body.findByRole("option", { name: "Mastercard – ····4444" }));
    await expect(select).toHaveTextContent("Mastercard – ····4444");
    await expect(submit).toBeEnabled();
    await userEvent.click(submit);
    await expect(canvas.queryByText("Visa ····4242")).not.toBeInTheDocument();
    await expect(within(canvas.getByText("Mastercard ····4444").closest("article")!).getByText("Default")).toBeVisible();
  },
};
export const DeleteDefaultWithChoiceMobile: Story = { ...DeleteDefaultWithChoice, globals: { viewport: { value: "mobile1", isRotated: false } } };
