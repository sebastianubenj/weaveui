import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { AddressesProvider } from "@/lib/addresses-provider";
import { SavedAddresses } from "./saved-addresses";

const meta = {
  title: "Views/Saved addresses",
  component: SavedAddresses,
  decorators: [Story => <AddressesProvider><Story /></AddressesProvider>],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SavedAddresses>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Desktop: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Options for Home" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const menu = await within(document.body).findByRole("menu");
    await expect(within(menu).getByRole("menuitem", { name: "Edit" })).not.toHaveAttribute("aria-disabled", "true");
    await expect(within(menu).getByRole("menuitem", { name: "Delete" })).toHaveAttribute("aria-disabled", "true");
    await expect(within(menu).queryByRole("menuitem", { name: "Set as default" })).toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Add new address" }));
    await expect(canvas.getByRole("heading", { name: "Add new address" })).toBeVisible();
    await userEvent.type(canvas.getByLabelText("First name"), "Alex");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("heading", { name: "Your addresses" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add new address" }));
    await expect(canvas.getByLabelText("First name")).toHaveValue("");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
  },
};
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
export const AddAddress: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Add new address" }));
  },
};
export const AddAddressMobile: Story = {
  ...AddAddress,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
export const OptionsDesktop: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Options for Work" });
    await userEvent.click(trigger);
    const menu = await within(document.body).findByRole("menu");
    await expect(within(menu).getByRole("menuitem", { name: "Set as default" })).not.toHaveAttribute("aria-disabled", "true");
    await expect(menu.getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger.getBoundingClientRect().bottom);
    await expect(Math.abs(menu.getBoundingClientRect().right - trigger.getBoundingClientRect().right)).toBeLessThan(2);
  },
};
export const OptionsMobile: Story = {
  ...OptionsDesktop,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
export const SetDefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const work = canvas.getByRole("heading", { name: "Work" }).closest("article")!;
    const home = canvas.getByRole("heading", { name: "Home" }).closest("article")!;
    await userEvent.click(canvas.getByRole("button", { name: "Options for Work" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Set as default" }));
    await expect(within(work).getByText("Default")).toBeVisible();
    await expect(within(home).queryByText("Default")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Options for Work" }));
    const menu = await body.findByRole("menu");
    await expect(within(menu).queryByRole("menuitem", { name: "Set as default" })).toBeNull();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: "Options for Home" }));
    await expect(await body.findByRole("menuitem", { name: "Set as default" })).toBeVisible();
  },
};
export const EditAddress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Options for Home" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit" }));
    await expect(canvas.getByRole("heading", { name: "Edit address" })).toBeVisible();
    await expect(canvas.getByLabelText("First name")).toHaveValue("John");
    await expect(canvas.getByRole("combobox", { name: "State" })).toHaveTextContent("NY");
    await expect(canvas.getByRole("checkbox", { name: "Set as default shipping address" })).toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Set as default shipping address" })).toBeDisabled();
    await userEvent.clear(canvas.getByLabelText("Street address"));
    await userEvent.type(canvas.getByLabelText("Street address"), "999 New Street");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByText(/123 Main Street/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Options for Home" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit" }));
    await userEvent.clear(canvas.getByLabelText("Street address"));
    await userEvent.type(canvas.getByLabelText("Street address"), "999 New Street");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    const home = canvas.getByRole("heading", { name: "Home" }).closest("article")!;
    await expect(within(home).getByText(/999 New Street/)).toBeVisible();
    await expect(within(home).getByText("Default")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Options for Work" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit" }));
    await expect(canvas.getByLabelText("Street address")).toHaveValue("456 Main Street");
    await userEvent.clear(canvas.getByLabelText("Street address"));
    await userEvent.type(canvas.getByLabelText("Street address"), "789 Market Street");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Set as default shipping address" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    const work = canvas.getByRole("heading", { name: "Work" }).closest("article")!;
    await expect(within(work).getByText(/789 Market Street/)).toBeVisible();
    await expect(within(work).getByText("Default")).toBeVisible();
  },
};
export const EditAddressMobile: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Options for Home" }));
    await userEvent.click(await within(document.body).findByRole("menuitem", { name: "Edit" }));
    await expect(canvas.getByRole("heading", { name: "Edit address" })).toBeVisible();
  },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
