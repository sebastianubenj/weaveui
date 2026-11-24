import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { Home } from "@/views/home/home";
import { PRODUCTS } from "@/lib/catalog";
import { BAG_STORAGE_KEY } from "@/lib/bag";

const meta = {
  title: "Views/Product detail",
  component: Home,
  args: { product: PRODUCTS.find((product) => product.id === "sp-12")! },
  parameters: { layout: "fullscreen" },
  beforeEach: () => { localStorage.removeItem(BAG_STORAGE_KEY); },
} satisfies Meta<typeof Home>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const track = canvas.getByRole("region", { name: "SP-12 Aluminum images" }).firstElementChild as HTMLElement;
    await expect(canvas.getByRole("heading", { name: "SP-12 Aluminum" })).toBeVisible();
    await expect(canvas.getByText("$399")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Next image" }));
    await waitFor(() => expect(canvas.getByRole("group", { name: "2 of 4" })).toBeVisible());
    await waitFor(() => expect(track.scrollLeft).toBeCloseTo(track.clientWidth * 2, 0));
    await userEvent.click(canvas.getByRole("button", { name: "Show image 1" }));
    await waitFor(() => expect(canvas.getByRole("img", { name: "SP-12 aluminum speaker" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Add to bag" }));
    await expect(canvas.getByRole("button", { name: "Bag, 1 item" })).toBeVisible();
  },
};

export const LoopForward: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const track = canvas.getByRole("group", { name: "Product images" });
    await userEvent.click(canvas.getByRole("button", { name: "Show image 4" }));
    await waitFor(() => expect(track.scrollLeft).toBeCloseTo(track.clientWidth * 4, 0));
    await userEvent.click(canvas.getByRole("button", { name: "Next image" }));
    await waitFor(() => expect(track.scrollLeft).toBeGreaterThan(track.clientWidth * 4));
    await waitFor(() => expect(track.scrollLeft).toBeCloseTo(track.clientWidth, 0));
    await expect(canvas.getByRole("button", { name: "Show image 1" })).toHaveAttribute("aria-current", "true");
  },
};

export const RapidNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole("button", { name: "Next image" });
    await userEvent.dblClick(next);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Show image 3" })).toHaveAttribute("aria-current", "true"));
    const track = canvas.getByRole("group", { name: "Product images" });
    await waitFor(() => expect(track.scrollLeft).toBeCloseTo(track.clientWidth * 3, 0));
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show image 3" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Show image 3" })).toHaveAttribute("aria-current", "true"));
  },
};

export const MobileSwipe: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const track = canvas.getByRole("group", { name: "Product images" });
    const initial = track.scrollLeft;
    const touch = (clientX: number) => new Touch({ identifier: 1, target: track, clientX, clientY: 200 });
    fireEvent.touchStart(track, { touches: [touch(250)] });
    fireEvent.touchMove(track, { touches: [touch(210)] });
    await expect(track.scrollLeft).toBeGreaterThan(initial);
    fireEvent.touchEnd(track, { changedTouches: [touch(210)] });
    await waitFor(() => expect(track.scrollLeft).toBeCloseTo(track.clientWidth * 2, 0));
    await expect(canvas.getByRole("button", { name: "Show image 2" })).toHaveAttribute("aria-current", "true");
    fireEvent.touchStart(track, { touches: [touch(800)] });
    fireEvent.touchMove(track, { touches: [touch(0)] });
    await expect(track.scrollLeft).toBeLessThanOrEqual(track.clientWidth * 3);
    fireEvent.touchEnd(track, { changedTouches: [touch(0)] });
    await waitFor(() => expect(track.scrollLeft).toBeCloseTo(track.clientWidth * 3, 0));
    await expect(canvas.getByRole("button", { name: "Show image 3" })).toHaveAttribute("aria-current", "true");
  },
};
