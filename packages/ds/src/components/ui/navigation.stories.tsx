import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Navigation, NavigationBagTrigger, NavigationLink, NavigationMenuLink, NavigationSearchTrigger, NavigationSection } from "./navigation";

const meta = {
  title: "Components/Navigation",
  component: Navigation,
  parameters: { layout: "fullscreen" },
  args: { logoHref: "#home", logoLabel: "Home", searchLabel: "Search", clearSearchLabel: "Clear search", menuLabel: "Menu", closeLabel: "Close", backLabel: "Back" },
} satisfies Meta<typeof Navigation>;
export default meta;
type Story = StoryObj<typeof meta>;

const menu = <NavigationSection><NavigationMenuLink href="#example">Example</NavigationMenuLink></NavigationSection>;
function Sample({ open = false }: { open?: boolean }) {
  return <Navigation logoHref="#home" logoLabel="Home" searchLabel="Search" clearSearchLabel="Clear search" menuLabel="Menu" closeLabel="Close" backLabel="Back" menu={menu} defaultOpen={open}>
    <NavigationLink href="#example" menu={menu} menuLabel="Explore menu">Explore</NavigationLink>
    <NavigationSearchTrigger />
    <NavigationBagTrigger aria-label="Bag" signInHref="#login" />
  </Navigation>;
}
export const Desktop: Story = { args: { logoHref: "#home", logoLabel: "Home", searchLabel: "Search", clearSearchLabel: "Clear search", menuLabel: "Menu", closeLabel: "Close", backLabel: "Back" }, render: () => <Sample />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Bag" }));
  await waitFor(() => expect(within(document.body).getByRole("heading", { name: "Your bag is empty" })).toBeVisible());
  await userEvent.keyboard("{Escape}");
}};
export const DesktopOpen: Story = { args: { logoHref: "#home", logoLabel: "Home", searchLabel: "Search", clearSearchLabel: "Clear search", menuLabel: "Menu", closeLabel: "Close", backLabel: "Back" }, render: () => <Sample />, play: async ({ canvasElement }) => { await userEvent.hover(within(canvasElement).getByRole("link", { name: "Explore" })); } };
export const Mobile: Story = { args: { logoHref: "#home", logoLabel: "Home", searchLabel: "Search", clearSearchLabel: "Clear search", menuLabel: "Menu", closeLabel: "Close", backLabel: "Back" }, globals: { viewport: { value: "mobile2", isRotated: false } }, render: () => <Sample /> };
export const MobileOpen: Story = { args: { logoHref: "#home", logoLabel: "Home", searchLabel: "Search", clearSearchLabel: "Clear search", menuLabel: "Menu", closeLabel: "Close", backLabel: "Back" }, globals: { viewport: { value: "mobile2", isRotated: false } }, render: () => <Sample open /> };
export const Empty: Story = { args: { appearance: "empty", logoHref: "#home", logoLabel: "Home" }, render: () => <Navigation appearance="empty" logoHref="#home" logoLabel="Home" /> };

export const SearchResults: Story = {
  args: { logoHref: "#home", logoLabel: "Home", searchLabel: "Search", clearSearchLabel: "Clear search", menuLabel: "Menu", closeLabel: "Close", backLabel: "Back" },
  render: () => <Navigation logoHref="#home" logoLabel="Home" searchLabel="Search" clearSearchLabel="Clear search" menuLabel="Menu" closeLabel="Close" backLabel="Back" defaultValue="search" searchValue="Example" searchResults={<NavigationSection heading="Search results"><NavigationMenuLink href="#example">Example result</NavigationMenuLink></NavigationSection>}><NavigationSearchTrigger /></Navigation>,
};

export const SearchEmpty: Story = {
  args: { logoHref: "#home", logoLabel: "Home", searchLabel: "Search", clearSearchLabel: "Clear search", menuLabel: "Menu", closeLabel: "Close", backLabel: "Back" },
  render: () => <Navigation logoHref="#home" logoLabel="Home" searchLabel="Search" clearSearchLabel="Clear search" menuLabel="Menu" closeLabel="Close" backLabel="Back" defaultValue="search" searchValue="Example" searchResults={<p>No results found.</p>}><NavigationSearchTrigger /></Navigation>,
};
