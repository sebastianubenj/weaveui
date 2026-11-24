import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Home } from "./home";
import { BAG_STORAGE_KEY } from "@/lib/bag";

const meta = {
  title: "Views/Home",
  component: Home,
  beforeEach: () => { localStorage.removeItem(BAG_STORAGE_KEY); },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Home>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyBagOpen: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Bag" }));
    await waitFor(() => expect(within(document.body).getByRole("heading", { name: "Your bag is empty" })).toBeVisible());
  },
};

export const ClearSearchDesktop: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    const search = await body.findByRole("searchbox", { name: "Search" });
    await userEvent.type(search, "xyz");
    const heading = await body.findByRole("heading", { name: "No results found" });
    await waitFor(() => expect(heading).toBeVisible());
    const clear = body.getAllByRole("button", { name: "Clear search" })[1];
    const panel = body.getByRole("searchbox", { name: "Search" }).closest('[data-slot="navigation-panel"]')!;
    await new Promise((resolve) => setTimeout(resolve, 400));
    const height = panel.getBoundingClientRect().height;
    await userEvent.hover(clear);
    await userEvent.click(clear);
    await expect(search).toHaveFocus();
    await expect(search).toHaveValue("");
    await new Promise((resolve) => setTimeout(resolve, 600));
    await expect(search).toBeVisible();
    await expect(panel.getBoundingClientRect().height).toBeLessThan(height);
    await userEvent.hover(canvas.getByRole("link", { name: "Discover" }));
    await waitFor(() => expect(body.getByRole("heading", { name: "Discover" })).toBeVisible());
    await waitFor(() => expect(panel.getBoundingClientRect().height).toBeLessThan(height));
  },
};

export const ClearSearchFieldDesktop: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    const search = await body.findByRole("searchbox", { name: "Search" });
    await userEvent.type(search, "xyz");
    await waitFor(() => expect(body.getByRole("heading", { name: "No results found" })).toBeVisible());
    const panel = search.closest('[data-slot="navigation-panel"]')!;
    await new Promise((resolve) => setTimeout(resolve, 400));
    const height = panel.getBoundingClientRect().height;
    await userEvent.click(body.getAllByRole("button", { name: "Clear search" })[0]);
    await waitFor(() => expect(panel.getBoundingClientRect().height).toBeLessThan(height));
    await expect(search).toHaveFocus();
  },
};

export const SearchProductsMobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    const search = await canvas.findByRole("searchbox", { name: "Search" });
    await userEvent.type(search, "sp-");
    const results = canvas.getByRole("region", { name: "Search results" });
    await expect(within(results).getAllByRole("link")).toHaveLength(3);
    await userEvent.clear(search);
    await userEvent.type(search, "xyz");
    await waitFor(() => expect(canvas.getByRole("heading", { name: "No results found" })).toBeVisible());
    await userEvent.click(canvas.getAllByRole("button", { name: "Clear search" })[1]);
    await expect(search).toHaveFocus();
    await expect(search).toHaveValue("");
    await userEvent.type(search, "sp-");
    await userEvent.click(within(canvas.getByRole("region", { name: "Search results" })).getByRole("link", { name: "SP-12 Aluminum" }));
    await waitFor(() => expect(canvas.getByRole("article", { name: "SP-12 Aluminum" })).toHaveFocus());
  },
};

async function playHome(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const body = within(document.body);

  await expect(
    canvas.getByRole("heading", { name: "All products" }),
  ).toBeVisible();
  await expect(canvas.getAllByRole("article")).toHaveLength(10);
  await expect(canvas.getAllByRole("button", { name: "Add" })).toHaveLength(10);
  await expect(canvas.getByRole("button", { name: "Bag" })).toBeVisible();

  await userEvent.click(canvas.getAllByRole("button", { name: "Add" })[0]);
  await expect(canvas.getByRole("button", { name: "Bag, 1 item" })).toBeVisible();
  await userEvent.click(canvas.getByRole("button", { name: "Bag, 1 item" }));

  await waitFor(() =>
    expect(body.getByRole("heading", { name: "Bag" })).toBeVisible(),
  );
  await expect(body.getAllByText("SP-16 Black").length).toBeGreaterThan(1);

  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(body.queryByRole("heading", { name: "Bag" })).toBeNull(),
  );
}

export const Desktop: Story = {
  play: async ({ canvasElement }) => {
    await playHome(canvasElement);
  },
};

export const Mobile: Story = {
  globals: {
    viewport: { value: "mobile2", isRotated: false },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "All products" }),
    ).toBeVisible();
    await expect(canvas.getAllByRole("article")).toHaveLength(10);
    await expect(canvas.getAllByRole("button", { name: "Add" })).toHaveLength(10);

    await userEvent.click(canvas.getAllByRole("button", { name: "Add" })[0]);
    await expect(
      canvas.getByRole("button", { name: "Bag, 1 item" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Bag, 1 item" }));

    await waitFor(() =>
      expect(canvas.getByRole("heading", { name: "Bag" })).toBeVisible(),
    );
    await expect(canvas.getAllByText("SP-16 Black").length).toBeGreaterThan(1);

    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(canvas.queryByRole("heading", { name: "Bag" })).toBeNull(),
    );
  },
};

export const BrowseProduct: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.hover(canvas.getByRole("link", { name: "Products" }));
    for (const name of ["Synths & Samplers", "Controllers & Mixers", "Mics & Recorders", "Speakers"]) {
      await waitFor(() => expect(body.getByRole("heading", { name })).toBeVisible());
    }
    await userEvent.click(await body.findByRole("link", { name: "A01 Synth Pad" }));
    await waitFor(() => expect(canvas.getByRole("article", { name: "A01 Synth Pad" })).toHaveFocus());
    await expect(canvas.queryByRole("button", { name: "Products menu" })).toHaveAttribute("aria-expanded", "false");
  },
};

export const BrowseProductMobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Menu" }));
    await userEvent.click(await canvas.findByRole("link", { name: "Products" }));
    await waitFor(() => expect(canvas.getByRole("heading", { name: "Synths & Samplers" })).toBeVisible());
    await waitFor(() => expect(canvas.getByRole("button", { name: "Back" })).toBeVisible());
    await expect(canvas.getByRole("heading", { name: "Speakers" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await userEvent.click(await canvas.findByRole("link", { name: "Products" }));
    await userEvent.click(await canvas.findByRole("link", { name: "A01 Synth Pad" }));
    await waitFor(() => expect(canvas.getByRole("article", { name: "A01 Synth Pad" })).toHaveFocus());
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Close" })).not.toBeInTheDocument());
  },
};

export const BrowseLearn: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await document.fonts.ready;
    const mark = canvas.getByRole("link", { name: "Home" }).getBoundingClientRect();
    const bag = canvas.getByRole("button", { name: "Bag" }).getBoundingClientRect();
    await expect(bag.right - mark.left).toBeCloseTo(658, 0);
    await userEvent.hover(canvas.getByRole("link", { name: "Learn" }));
    await waitFor(() => expect(body.getByRole("heading", { name: "Learn" })).toBeVisible());
    for (const name of ["Getting started", "Product setup", "Care & maintenance"]) {
      await waitFor(() => expect(body.getByRole("link", { name })).toBeVisible());
    }
  },
};

export const BrowseLearnMobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Menu" }));
    const names = ["Products", "Discover", "Learn", "Support", "About"];
    const links = canvas.getAllByRole("link").filter((link) => names.includes(link.textContent ?? ""));
    await expect(links.map((link) => link.textContent)).toEqual(names);
    await userEvent.click(canvas.getByRole("link", { name: "Learn" }));
    for (const name of ["Getting started", "Product setup", "Care & maintenance"]) {
      await waitFor(() => expect(canvas.getByRole("link", { name })).toBeVisible());
    }
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await waitFor(() => expect(canvas.getByRole("link", { name: "Learn" })).toBeVisible());
  },
};
