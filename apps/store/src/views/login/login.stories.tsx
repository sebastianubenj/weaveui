import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Login } from "./login";

const meta = {
  title: "Views/Login",
  component: Login,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Login>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("banner")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Home" })).toBeInTheDocument();
    const email = canvas.getByRole("textbox", { name: /email/i });
    await userEvent.tab();
    await userEvent.tab();
    await expect(email).toHaveFocus();
    const wrapper = email.parentElement!;
    await expect(getComputedStyle(wrapper).outlineStyle).toBe("solid");
    await expect(getComputedStyle(wrapper).outlineWidth).toBe("2px");
    await expect(getComputedStyle(wrapper).outlineOffset).toBe("3px");
  },
};
