import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { expect, userEvent, within } from "storybook/test";
import { AddressesProvider } from "@/lib/addresses-provider";
import { SavedAddresses } from "./saved-addresses";

const meta = {
  title: "Views/Saved addresses",
  component: SavedAddresses,
  decorators: [Story => <MemoryRouter initialEntries={["/saved-addresses"]}><AddressesProvider><Story /></AddressesProvider></MemoryRouter>],
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
    await expect(within(menu).getByRole("menuitem", { name: "Edit address" })).not.toHaveAttribute("aria-disabled", "true");
    await expect(within(menu).getByRole("menuitem", { name: "Delete" })).not.toHaveAttribute("aria-disabled", "true");
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
    await expect(within(canvasElement).getByRole("checkbox", { name: "Set as default shipping address" })).not.toBeChecked();
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
    await expect(within(menu).getAllByRole("menuitem").map(item => item.textContent)).toEqual(["Set as default", "Edit address", "Delete"]);
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
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit address" }));
    await expect(canvas.getByRole("heading", { name: "Edit address" })).toBeVisible();
    await expect(canvas.getByLabelText("First name")).toHaveValue("John");
    await expect(canvas.getByRole("combobox", { name: "State" })).toHaveTextContent("NY");
    await expect(canvas.queryByRole("checkbox", { name: "Set as default shipping address" })).toBeNull();
    await expect(canvas.getByText("Default")).toBeVisible();
    await userEvent.clear(canvas.getByLabelText("Street address"));
    await userEvent.type(canvas.getByLabelText("Street address"), "999 New Street");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByText(/123 Main Street/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Options for Home" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit address" }));
    await userEvent.clear(canvas.getByLabelText("Street address"));
    await userEvent.type(canvas.getByLabelText("Street address"), "999 New Street");
    await userEvent.clear(canvas.getByLabelText("ZIP code"));
    await userEvent.type(canvas.getByLabelText("ZIP code"), "123456789");
    await expect(canvas.getByLabelText("ZIP code")).toHaveValue("12345-6789");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    const home = canvas.getByRole("heading", { name: "Home" }).closest("article")!;
    await expect(within(home).getByText(/999 New Street/)).toBeVisible();
    await expect(within(home).getByText(/12345-6789/)).toBeVisible();
    await expect(within(home).getByText("Default")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Options for Work" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit address" }));
    await expect(canvas.getByLabelText("Street address")).toHaveValue("456 Main Street");
    await expect(canvas.getByRole("checkbox", { name: "Set as default shipping address" })).not.toBeChecked();
    await expect(canvas.queryByText("Default")).toBeNull();
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
    await userEvent.click(await within(document.body).findByRole("menuitem", { name: "Edit address" }));
    await expect(canvas.getByRole("heading", { name: "Edit address" })).toBeVisible();
  },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

export const DeleteAddresses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    async function openDelete(name: string) {
      await userEvent.click(canvas.getByRole("button", { name: `Options for ${name}` }));
      await userEvent.click(await body.findByRole("menuitem", { name: "Delete" }));
      return within(await body.findByRole("dialog"));
    }
    let dialog = await openDelete("Work");
    await expect(dialog.getByRole("heading", { name: "Delete address?" })).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("heading", { name: "Work" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add new address" }));
    await expect(canvas.getByRole("heading", { name: "Add new address" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await openDelete("Home");
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("dialog")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Add new address" }));
    await expect(canvas.getByRole("heading", { name: "Add new address" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    dialog = await openDelete("Home");
    await expect(body.getByRole("dialog")).toHaveAccessibleDescription("Work will become your new default shipping address.");
    await userEvent.click(dialog.getByRole("button", { name: "Delete address" }));
    await expect(canvas.queryByRole("heading", { name: "Home" })).toBeNull();
    await expect(within(canvas.getByRole("heading", { name: "Work" }).closest("article")!).getByText("Default")).toBeVisible();
    dialog = await openDelete("Work");
    await userEvent.click(dialog.getByRole("button", { name: "Delete address" }));
    await expect(canvas.queryByRole("heading", { name: "Work" })).toBeNull();
    await expect(canvas.getByRole("heading", { name: "No saved addresses yet" })).toBeVisible();
    await expect(canvas.getByText("Add a shipping address to make your next checkout faster.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add new address" }));
    await expect(canvas.getByRole("heading", { name: "Add new address" })).toBeVisible();
    await expect(canvas.queryByRole("checkbox", { name: "Set as default shipping address" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("heading", { name: "No saved addresses yet" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add new address" }));
    await userEvent.type(canvas.getByLabelText("First name"), "Alex");
    await userEvent.type(canvas.getByLabelText("Last name"), "Doe");
    await userEvent.type(canvas.getByLabelText("Street address"), "789 Market Street");
    await userEvent.type(canvas.getByLabelText("City"), "New York");
    await userEvent.click(canvas.getByRole("combobox", { name: "State" }));
    await userEvent.click(await body.findByRole("option", { name: "NY" }));
    await userEvent.type(canvas.getByLabelText("ZIP code"), "10001");
    await userEvent.type(canvas.getByLabelText("Address name"), "Studio");
    await userEvent.click(canvas.getByRole("button", { name: "Save address" }));
    await expect(within(canvas.getByRole("heading", { name: "Studio" }).closest("article")!).getByText("Default")).toBeVisible();
  },
};

export const EmptyState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    for (const name of ["Work", "Home"]) {
      await userEvent.click(canvas.getByRole("button", { name: `Options for ${name}` }));
      await userEvent.click(await body.findByRole("menuitem", { name: "Delete" }));
      await userEvent.click(within(await body.findByRole("dialog")).getByRole("button", { name: "Delete address" }));
    }
    await expect(canvas.getByRole("heading", { name: "Saved addresses", level: 1 })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "No saved addresses yet", level: 2 })).toBeVisible();
    await expect(canvas.queryByText("Manage your saved shipping addresses.")).toBeNull();
  },
};
export const EmptyStateMobile: Story = { ...EmptyState, globals: { viewport: { value: "mobile1", isRotated: false } } };

export const DeleteDefaultWithChoice: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Add new address" }));
    await userEvent.type(canvas.getByLabelText("First name"), "Alex");
    await userEvent.type(canvas.getByLabelText("Last name"), "Doe");
    await userEvent.type(canvas.getByLabelText("Street address"), "789 Market Street");
    await userEvent.type(canvas.getByLabelText("City"), "New York");
    await userEvent.click(canvas.getByRole("combobox", { name: "State" }));
    await userEvent.click(await body.findByRole("option", { name: "NY" }));
    await userEvent.type(canvas.getByLabelText("ZIP code"), "10001");
    await userEvent.type(canvas.getByLabelText("Address name"), "Studio");
    await userEvent.click(canvas.getByRole("button", { name: "Save address" }));
    await userEvent.click(canvas.getByRole("button", { name: "Options for Home" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Delete" }));
    const dialog = within(await body.findByRole("dialog"));
    const submit = dialog.getByRole("button", { name: "Delete address" });
    await expect(submit).toBeDisabled();
    await userEvent.click(dialog.getByRole("combobox", { name: "New default address" }));
    await expect(await body.findByRole("option", { name: "Work – 456 Main Street, Apt 8C" })).toBeVisible();
    await userEvent.click(await body.findByRole("option", { name: "Studio – 789 Market Street" }));
    await expect(dialog.getByRole("combobox", { name: "New default address" })).toHaveTextContent("Studio – 789 Market Street");
    await expect(submit).toBeEnabled();
    await userEvent.click(submit);
    await expect(canvas.queryByRole("heading", { name: "Home" })).toBeNull();
    await expect(within(canvas.getByRole("heading", { name: "Studio" }).closest("article")!).getByText("Default")).toBeVisible();
  },
};
export const DeleteDefaultWithChoiceMobile: Story = { ...DeleteDefaultWithChoice, globals: { viewport: { value: "mobile1", isRotated: false } } };

export const DeleteNonDefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Options for Work" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Delete" }));
    const dialog = within(await body.findByRole("dialog"));
    await userEvent.click(dialog.getByRole("button", { name: "Delete address" }));
    await expect(canvas.queryByRole("heading", { name: "Work" })).toBeNull();
    await expect(within(canvas.getByRole("heading", { name: "Home" }).closest("article")!).getByText("Default")).toBeVisible();
  },
};
