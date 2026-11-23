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
