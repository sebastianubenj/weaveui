import { StrictMode } from "react";
import { MemoryRouter } from "react-router-dom";
import type { AuthChangeEvent, Session, AuthError } from "@supabase/supabase-js";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, mocked, userEvent, waitFor, within } from "storybook/test";

import { App } from "./App";
import { AuthProvider } from "./lib/auth-provider";
import { BAG_STORAGE_KEY } from "./lib/bag";
import { checkCompromisedPassword } from "./lib/password-security";
import { exampleSession, supabase as mockSupabase } from "./lib/__mocks__/supabase";
import { getSupabase } from "./lib/supabase";

const mockAuth = mocked(mockSupabase.auth, true);

function resetSupabaseMock(initialSession: Session | null = null) {
  let session = initialSession;
  const listeners = new Set<(event: AuthChangeEvent, session: Session | null) => void | Promise<void>>();
  const changeSession = (next: Session | null, event: AuthChangeEvent) => {
    session = next;
    listeners.forEach((listener) => { void listener(event, next); });
  };
  mockAuth.getSession.mockReset().mockImplementation(async () => session ? ({ data: { session }, error: null }) : ({ data: { session: null }, error: null }));
  mockAuth.onAuthStateChange.mockReset().mockImplementation((listener) => {
    listeners.add(listener);
    queueMicrotask(() => { if (listeners.has(listener)) void listener("INITIAL_SESSION", session); });
    return { data: { subscription: { id: "test", callback: listener, unsubscribe: () => { listeners.delete(listener); } } } };
  });
  mockAuth.signInWithPassword.mockReset().mockImplementation(async () => {
    changeSession(exampleSession, "SIGNED_IN");
    return { data: { user: exampleSession.user, session: exampleSession }, error: null };
  });
  mockAuth.exchangeCodeForSession.mockReset().mockImplementation(async () => {
    changeSession(exampleSession, "PASSWORD_RECOVERY");
    return { data: { user: exampleSession.user, session: exampleSession, redirectType: "recovery" }, error: null };
  });
  mockAuth.signOut.mockReset().mockImplementation(async () => {
    changeSession(null, "SIGNED_OUT");
    return { error: null };
  });
  mockAuth.signUp.mockReset().mockResolvedValue({ data: { user: exampleSession.user, session: null }, error: null });
  mockAuth.resetPasswordForEmail.mockReset().mockResolvedValue({ data: {}, error: null });
  mockAuth.resend.mockReset().mockResolvedValue({ data: { user: null, session: null }, error: null });
  mockAuth.updateUser.mockReset().mockResolvedValue({ data: { user: exampleSession.user }, error: null });
  mocked(getSupabase).mockResolvedValue(mockSupabase);
}


const meta = {
  title: "App/Authentication",
  component: App,
  parameters: { layout: "fullscreen", route: "/login" },
  decorators: [(Story, context) => (
    <StrictMode>
      <MemoryRouter key={context.id} initialEntries={[context.parameters.route]}>
        <AuthProvider><Story /></AuthProvider>
      </MemoryRouter>
    </StrictMode>
  )],
  beforeEach: () => {
    const originalUrl = window.location.href;
    localStorage.removeItem(BAG_STORAGE_KEY);
    resetSupabaseMock();
    mocked(checkCompromisedPassword).mockResolvedValue("clear");
    return () => { window.history.replaceState({}, "", originalUrl); };
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

async function submitLogin(element: HTMLElement) {
  const canvas = within(element);
  await userEvent.type(await canvas.findByLabelText("Email"), "alex@example.com");
  await userEvent.type(canvas.getByLabelText("Password"), "a-long-test-password");
  await userEvent.click(canvas.getByRole("button", { name: "Log in" }));
}

export const LoginAndLogout: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await submitLogin(canvasElement);
    await expect(await canvas.findByRole("heading", { name: "All products" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Bag" }));
    await userEvent.click(await body.findByRole("button", { name: "Log out" }));
    await waitFor(() => expect(body.getAllByRole("link", { name: "Log in" }).length).toBeGreaterThan(0));
    await expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("heading", { name: "Your bag is empty" })).not.toBeInTheDocument());
  },
};

export const UnconfirmedEmail: Story = {
  beforeEach: () => {
    mockAuth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: { code: "email_not_confirmed", message: "Unconfirmed" } as AuthError });
  },
  play: async ({ canvasElement }) => {
    await submitLogin(canvasElement);
    await expect(await within(canvasElement).findByRole("alert")).toHaveTextContent("Confirm your email");
  },
};

async function submitRegistration(element: HTMLElement) {
  const canvas = within(element);
  await userEvent.type(await canvas.findByLabelText("Full name"), "Alex Example");
  await userEvent.type(await canvas.findByLabelText("Email"), "alex@example.com");
  await userEvent.type(await canvas.findByLabelText("Password"), "a-long-test-password");
  await userEvent.type(await canvas.findByLabelText("Confirm your password"), "a-long-test-password");
  await userEvent.click(canvas.getByRole("button", { name: "Create account" }));
}

export const RegisterAndResend: Story = {
  parameters: { route: "/register" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitRegistration(canvasElement);
    await expect(await canvas.findByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(checkCompromisedPassword).toHaveBeenCalledWith("a-long-test-password");
    await userEvent.click(canvas.getByRole("button", { name: "Resend confirmation email" }));
    await waitFor(() => expect(mockAuth.resend).toHaveBeenCalledTimes(1));
  },
};

export const RecoveryRequest: Story = {
  parameters: { route: "/forgot-password" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText("Email"), "alex@example.com");
    await userEvent.click(canvas.getByRole("button", { name: /send/i }));
    await expect(await canvas.findByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith("alex@example.com", {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },
};

export const RecoverAndUpdate: Story = {
  parameters: { route: "/reset-password" },
  beforeEach: () => { window.history.replaceState({}, "", "/reset-password?code=valid-recovery"); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText("Password"), "a-new-test-password");
    await userEvent.type(canvas.getByLabelText("Confirm your password"), "a-new-test-password");
    await userEvent.click(canvas.getByRole("button", { name: "Update password" }));
    await expect(await canvas.findByRole("heading", { name: "Password updated" })).toBeVisible();
    await expect(mockAuth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    await expect(mockAuth.updateUser).toHaveBeenCalledWith({ password: "a-new-test-password" });
    await expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("link", { name: "Log in" })).toBeVisible();
  },
};

export const ExpiredLinkWithExistingSession: Story = {
  parameters: { route: "/reset-password" },
  beforeEach: () => {
    resetSupabaseMock(exampleSession);
    window.history.replaceState({}, "", "/reset-password?code=expired-recovery");
    mockAuth.exchangeCodeForSession.mockResolvedValue({ data: { user: null, session: null }, error: { code: "flow_state_expired" } as AuthError });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("heading", { name: "This link is not valid" })).toBeVisible();
    await expect(canvas.queryByLabelText("Password")).not.toBeInTheDocument();
    await expect(mockAuth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
  },
};

export const RestoreSession: Story = {
  beforeEach: () => { resetSupabaseMock(exampleSession); },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("heading", { name: "All products" })).toBeVisible();
    await expect(mockAuth.signInWithPassword).not.toHaveBeenCalled();
  },
};

export const SessionLoadFailure: Story = {
  beforeEach: () => { mockAuth.getSession.mockRejectedValue(new Error("Storage unavailable")); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("We couldn’t restore your session");
    await expect(canvas.getByRole("button", { name: "Log in" })).toBeVisible();
  },
};

export const EmailConfirmation: Story = {
  beforeEach: () => { window.history.replaceState({}, "", "/login?code=valid-confirmation"); },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("heading", { name: "All products" })).toBeVisible();
    await expect(mockAuth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
  },
};

export const CompromisedRegistration: Story = {
  parameters: { route: "/register" },
  beforeEach: () => { mocked(checkCompromisedPassword).mockResolvedValue("compromised"); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitRegistration(canvasElement);
    await expect(await canvas.findByText("This password has appeared in a data breach. Choose a different password.")).toBeVisible();
    await expect(mockAuth.signUp).not.toHaveBeenCalled();
    await waitFor(() => expect(canvas.getByLabelText("Password")).toHaveFocus());
  },
};

export const PasswordCheckUnavailable: Story = {
  parameters: { route: "/register" },
  beforeEach: () => { mocked(checkCompromisedPassword).mockResolvedValue("unavailable"); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitRegistration(canvasElement);
    await expect(await canvas.findByText("We couldn’t check this password right now. Please try again.")).toBeVisible();
    await expect(mockAuth.signUp).not.toHaveBeenCalled();
    await expect(canvas.getByRole("button", { name: "Create account" })).toBeEnabled();
  },
};

export const LogoutFailure: Story = {
  parameters: { route: "/" },
  beforeEach: () => {
    resetSupabaseMock(exampleSession);
    mockAuth.signOut.mockResolvedValue({ error: { message: "Offline" } as AuthError });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Bag" }));
    await userEvent.click(await body.findByRole("button", { name: "Log out" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("We couldn’t log you out");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("heading", { name: "Your bag is empty" })).toBeNull());
    await userEvent.click(canvas.getByRole("button", { name: "Bag" }));
    await waitFor(() => expect(body.getByRole("button", { name: "Log out" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("heading", { name: "Your bag is empty" })).toBeNull());
  },
};

export const RecoveryLogoutRetry: Story = {
  parameters: { route: "/reset-password" },
  beforeEach: () => {
    window.history.replaceState({}, "", "/reset-password?code=recovery-logout-retry");
    mockAuth.signOut.mockResolvedValueOnce({ error: { message: "Offline" } as AuthError });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText("Password"), "a-new-test-password");
    await userEvent.type(canvas.getByLabelText("Confirm your password"), "a-new-test-password");
    await userEvent.click(canvas.getByRole("button", { name: "Update password" }));
    await expect(await canvas.findByRole("heading", { name: "Password updated" })).toBeVisible();
    await expect(canvas.getByRole("alert")).toHaveTextContent("We couldn’t log you out");
    await userEvent.click(canvas.getByRole("link", { name: "Log out" }));
    await expect(await canvas.findByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(mockAuth.updateUser).toHaveBeenCalledTimes(1);
  },
};

export const BagAfterLogin: Story = {
  beforeEach: () => {
    localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify([{ productId: "sp-16", quantity: 2 }]));
  },
  play: async ({ canvasElement }) => {
    await submitLogin(canvasElement);
    await expect(await within(canvasElement).findByRole("button", { name: "Bag, 2 items" })).toBeVisible();
  },
};

export const CallbackConnectionFailure: Story = {
  parameters: { route: "/reset-password" },
  beforeEach: () => {
    window.history.replaceState({}, "", "/reset-password?code=offline-recovery");
    mockAuth.exchangeCodeForSession.mockResolvedValue({ data: { user: null, session: null },
      error: { name: "AuthRetryableFetchError", message: "Offline" } as AuthError,
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Check your connection and try again");
    await expect(canvas.queryByRole("heading", { name: "This link is not valid" })).not.toBeInTheDocument();
    await expect(window.location.search).toBe("?code=offline-recovery");
    mockAuth.exchangeCodeForSession.mockImplementation(async () => {
      return { data: { user: exampleSession.user, session: exampleSession, redirectType: "recovery" }, error: null };
    });
    mockAuth.getSession.mockResolvedValue({ data: { session: exampleSession }, error: null });
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    await expect(await canvas.findByRole("button", { name: "Update password" })).toBeVisible();
    await expect(mockAuth.exchangeCodeForSession).toHaveBeenCalledTimes(2);
  },
};

export const PasswordRejectedByServer: Story = {
  parameters: { route: "/reset-password" },
  beforeEach: () => {
    resetSupabaseMock(exampleSession);
    mockAuth.updateUser.mockResolvedValue({ data: { user: null }, error: { code: "same_password", message: "Rejected" } as AuthError });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText("Password"), "a-new-test-password");
    await userEvent.type(canvas.getByLabelText("Confirm your password"), "a-new-test-password");
    await userEvent.click(canvas.getByRole("button", { name: "Update password" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Choose a password different from your current password.");
    await expect(mockAuth.signOut).not.toHaveBeenCalled();
  },
};

export const BagFlow: Story = {
  parameters: { route: "/products/sp-16" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Add to bag" }));
    await userEvent.click(canvas.getByRole("button", { name: "Bag, 1 item" }));
    const review = await within(document.body).findByRole("button", { name: "Review bag" });
    await userEvent.click(review);
    await expect(await canvas.findByRole("heading", { name: "Bag", level: 1 })).toBeVisible();
    const increase = canvas.getByRole("button", { name: /Increase quantity of/ });
    const name = increase.getAttribute("aria-label")!.replace("Increase quantity of ", "");
    await userEvent.click(increase);
    await expect(canvas.getByLabelText("Quantity: 2")).toBeVisible();
    await expect(canvas.getAllByText("$4,598")).toHaveLength(3);
    await expect(canvas.getByText("Free")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Bag, 2 items" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: `Decrease quantity of ${name}` }));
    await expect(canvas.getByRole("button", { name: `Decrease quantity of ${name}` })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: `Remove ${name}` }));
    await expect(canvas.getByRole("heading", { name: "Your bag is empty", level: 1 })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    await expect(localStorage.getItem(BAG_STORAGE_KEY)).toBe("[]");
  },
};

export const BagWithItems: Story = {
  parameters: { route: "/bag" },
  beforeEach: () => {
    localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify([
      { productId: "sp-12", quantity: 1 },
      { productId: "sp-16", quantity: 1 },
      { productId: "ar-4", quantity: 3 },
      { productId: "sp-40", quantity: 1 },
      { productId: "fx-32", quantity: 1 },
    ]));
  },
};

export const EmptyBagSignedIn: Story = {
  parameters: { route: "/bag" },
  beforeEach: () => { resetSupabaseMock(exampleSession); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("heading", { name: "Your bag is empty" })).toBeVisible();
    await waitFor(() => expect(canvas.getByText("Start adding items.")).toBeVisible());
    await expect(canvas.queryByRole("link", { name: "Log in" })).toBeNull();
  },
};

export const CheckoutFlow: Story = {
  parameters: { route: "/bag" },
  beforeEach: () => {
    localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify([{ productId: "sp-16", quantity: 1 }]));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Go to checkout" }));
    await expect(await canvas.findByRole("heading", { name: "Checkout" })).toBeVisible();
    await expect(canvas.getAllByText("$2,299")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: "Change shipping address" }));
    await userEvent.click(canvas.getByRole("button", { name: "Use this address" }));
    await expect(canvas.getByRole("heading", { name: "Shipping address" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Change shipping address" }));
    await userEvent.click(canvas.getByRole("radio", { name: /Work/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Use this address" }));
    await expect(canvas.getByText("456 Main Street, Apt 8C")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Change payment method" }));
    await userEvent.click(canvas.getByRole("button", { name: "Use this card" }));
    await expect(canvas.getByRole("heading", { name: "Payment method" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Change payment method" }));
    await userEvent.click(canvas.getByRole("radio", { name: /Mastercard/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Use this card" }));
    await expect(canvas.getByText("Mastercard ····3737")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Change payment method" }));
    await userEvent.click(canvas.getByRole("button", { name: /Add new card/ }));
    await expect(canvas.getByLabelText("Cardholder name")).toBeVisible();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Billing address same as shipping address" }));
    await expect(canvas.getByLabelText("Street address")).toBeVisible();
    const billingZip = canvas.getByLabelText("ZIP code");
    await userEvent.type(billingZip, "12a3456789");
    await expect(billingZip).toHaveValue("12345-6789");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await userEvent.click(canvas.getByRole("button", { name: "Confirm and pay" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("No payment was made");
  },
};

export const CheckoutMobile: Story = {
  parameters: { route: "/checkout" },
  globals: { viewport: { value: "mobile1", isRotated: false } },
  beforeEach: () => { localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify([{ productId: "sp-16", quantity: 1 }])); },
};

export const CheckoutNewDetails: Story = {
  parameters: { route: "/checkout" },
  beforeEach: () => { localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify([{ productId: "sp-16", quantity: 1 }])); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Change shipping address" }));
    await userEvent.click(canvas.getByRole("button", { name: /Add new address/ }));
    await userEvent.type(canvas.getByLabelText("First name"), "Alex");
    await userEvent.type(canvas.getByLabelText("Last name"), "Doe");
    await userEvent.type(canvas.getByLabelText("Street address"), "789 Market Street");
    await userEvent.type(canvas.getByLabelText("City"), "New York");
    await userEvent.click(canvas.getByRole("combobox", { name: "State" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "NY" }));
    const zip = canvas.getByLabelText("ZIP code");
    await userEvent.type(zip, "100a0");
    await expect(zip).toHaveValue("1000");
    await expect(zip).toBeInvalid();
    await userEvent.type(zip, "1");
    await expect(zip).toBeValid();
    await userEvent.type(canvas.getByLabelText("Address name"), "Studio");
    await userEvent.click(canvas.getByRole("button", { name: "Save and use address" }));
    await expect(canvas.getByText("789 Market Street")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Change payment method" }));
    await userEvent.click(canvas.getByRole("button", { name: /Add new card/ }));
    await userEvent.type(canvas.getByLabelText("Cardholder name"), "Alex Doe");
    const cardNumber = canvas.getByLabelText("Card number");
    await userEvent.type(cardNumber, "4242a424242424242");
    await expect(cardNumber).toHaveValue("4242 4242 4242 4242");
    const expiration = canvas.getByLabelText("Expiration date");
    await userEvent.type(expiration, "1330");
    await expect(expiration).toHaveValue("13/30");
    await expect(expiration).toBeInvalid();
    await userEvent.clear(expiration);
    await userEvent.type(expiration, "1230");
    await expect(expiration).toHaveValue("12/30");
    const security = canvas.getByLabelText("Security code");
    await userEvent.type(security, "1a23");
    await expect(security).toHaveValue("123");
    await userEvent.click(canvas.getByRole("button", { name: "Save and use card" }));
    await expect(canvas.getByText("Visa ····4242")).toBeVisible();
  },
};


export const CheckoutCardBrands: Story = {
  parameters: { route: "/checkout" },
  beforeEach: () => { localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify([{ productId: "sp-16", quantity: 1 }])); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Change payment method" }));
    await userEvent.click(canvas.getByRole("button", { name: /Add new card/ }));
    const number = canvas.getByLabelText("Card number");
    const security = canvas.getByLabelText("Security code");
    await userEvent.type(number, "3782822463100059");
    await expect(number).toHaveValue("3782 822463 10005");
    await expect(canvas.getByRole("img", { name: "American Express" })).toBeVisible();
    await expect(security).toHaveAttribute("placeholder", "CID");
    await userEvent.type(security, "123");
    await expect(security).toBeInvalid();
    await userEvent.type(security, "4");
    await expect(security).toBeValid();
    await userEvent.clear(number);
    await userEvent.type(number, "5555555555554444999");
    await expect(number).toHaveValue("5555 5555 5555 4444");
    await expect(number).toBeValid();
    await expect(canvas.getByRole("img", { name: "Mastercard" })).toBeVisible();
    await expect(security).toBeInvalid();
    await userEvent.clear(number);
    await userEvent.type(number, "6011111111111117");
    await expect(canvas.getByRole("img", { name: "Discover" })).toBeVisible();
    await userEvent.clear(number);
    await userEvent.type(number, "4111111111111111999");
    await expect(number).toHaveValue("4111 1111 1111 1111");
    await expect(number).toBeValid();
    await expect(canvas.getByRole("img", { name: "Visa" })).toBeVisible();
    await userEvent.keyboard("{Backspace}");
    await expect(number).toBeInvalid();
    await userEvent.clear(number);
    await expect(canvas.queryByRole("img", { name: "Visa" })).not.toBeInTheDocument();
  },
};
