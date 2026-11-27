import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrderConfirmed } from "./order-confirmed";

const meta = {
  title: "Views/Order confirmed",
  component: OrderConfirmed,
  parameters: { layout: "fullscreen" },
  args: {
    order: {
      id: "DEMO1028",
      items: [
        { id: "sp-12", name: "SP-12 Aluminum", src: "/product-sp-12.png", priceCents: 39900, quantity: 1 },
        { id: "sp-16", name: "SP-16 Black", src: "/product-sp-16.png", priceCents: 229900, quantity: 1 },
        { id: "ar-4", name: "AR-4 Recorder", src: "/product-ar-4.png", priceCents: 24900, quantity: 3 },
        { id: "sp-40", name: "SP-40 Wavek + Mic", src: "/product-sp-40.png", priceCents: 35900, quantity: 1 },
        { id: "fx-32", name: "FX-32 DJ Controller", src: "/product-fx-32.png", priceCents: 149900, quantity: 1 },
      ],
      address: { name: "Home", first: "John", last: "Doe", street: "123 Main Street", line2: "Apt 4B", city: "New York", state: "NY", zip: "10001" },
      card: { brand: "Visa", last4: "4242" },
      total: 530300,
    },
    onContinue: () => {},
  },
} satisfies Meta<typeof OrderConfirmed>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Desktop: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
