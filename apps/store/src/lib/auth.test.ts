import { beforeEach, describe, expect, test, vi } from "vitest";

const { auth, setRememberSession } = vi.hoisted(() => ({
  auth: {
    exchangeCodeForSession: vi.fn(), getSession: vi.fn(), signUp: vi.fn(),
    signInWithPassword: vi.fn(), resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(), resend: vi.fn(), signOut: vi.fn(),
  },
  setRememberSession: vi.fn(),
}));

vi.mock("./supabase", () => ({
  getSupabase: async () => ({ auth }), setRememberSession,
  authRedirect: (path: string) => `https://store.test${path}`,
}));

function locationAt(path: string) {
  const location = new URL(path, "https://store.test");
  vi.stubGlobal("window", {
    location,
    history: { replaceState: vi.fn((_state, _unused, next: string) => location.href = new URL(next, location).href) },
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  locationAt("/");
});

describe("email callbacks", () => {
  test("an expired code stays expired even with an existing account session", async () => {
    locationAt("/reset-password?code=expired");
    auth.exchangeCodeForSession.mockResolvedValue({ error: { code: "flow_state_expired" } });
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: "previous-user" } } } });
    const { consumeAuthCallback } = await import("./auth");
    expect(await consumeAuthCallback()).toBe("expired");
    expect(window.location.search).toBe("");
  });

  test("concurrent mounts exchange a one-time code only once", async () => {
    locationAt("/login?code=valid&next=home");
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    const { consumeAuthCallback } = await import("./auth");
    expect(await Promise.all([consumeAuthCallback(), consumeAuthCallback()])).toEqual(["ok", "ok"]);
    expect(auth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe("?next=home");
    expect(await consumeAuthCallback()).toBe("none");
  });

  test("a callback error from the email link does not exchange a code", async () => {
    locationAt("/reset-password#error_code=otp_expired");
    const { consumeAuthCallback } = await import("./auth");
    expect(await consumeAuthCallback()).toBe("expired");
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  test("reopening a consumed code does not reuse its previous successful result", async () => {
    const { consumeAuthCallback } = await import("./auth");
    locationAt("/login?code=one-time-code");
    auth.exchangeCodeForSession.mockResolvedValueOnce({ error: null });
    expect(await consumeAuthCallback()).toBe("ok");
    locationAt("/login?code=one-time-code");
    auth.exchangeCodeForSession.mockResolvedValueOnce({ error: { code: "flow_state_expired", message: "Expired" } });
    expect(await consumeAuthCallback()).toBe("expired");
    expect(auth.exchangeCodeForSession).toHaveBeenCalledTimes(2);
  });

  test("a connection failure preserves the code for retry instead of calling it expired", async () => {
    locationAt("/reset-password?code=retry-me");
    auth.exchangeCodeForSession.mockResolvedValue({ error: { name: "AuthRetryableFetchError", message: "Offline" } });
    const { consumeAuthCallback } = await import("./auth");
    expect(await consumeAuthCallback()).toBe("network");
    expect(window.location.search).toBe("?code=retry-me");
  });
});

describe("account operations", () => {
  test("registers with the confirmation redirect and preserves duplicate-account privacy", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [] }, session: null }, error: null });
    const { registerAccount } = await import("./auth");
    expect(await registerAccount({ name: "Alex", email: "alex@example.com", password: "a-long-test-password" })).toBe("confirm-email");
    expect(auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
      options: { data: { full_name: "Alex" }, emailRedirectTo: "https://store.test/login" },
    }));
  });

  test("honors remember-me and separates unconfirmed email from invalid credentials", async () => {
    const { signInAccount } = await import("./auth");
    const values = { email: "alex@example.com", password: "a-long-test-password", rememberMe: false };
    auth.signInWithPassword.mockResolvedValueOnce({ error: { code: "email_not_confirmed", message: "Unconfirmed" } });
    expect(await signInAccount(values)).toBe("email-not-confirmed");
    expect(setRememberSession).toHaveBeenCalledWith(false);
    auth.signInWithPassword.mockResolvedValueOnce({ error: { code: "invalid_credentials", message: "Invalid" } });
    expect(await signInAccount(values)).toBe("invalid-credentials");
  });

  test("preserves recovery throttling and targets the recovery route", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: { code: "over_email_send_rate_limit", message: "Only request this after 45 seconds" } });
    const { requestPasswordReset } = await import("./auth");
    expect(await requestPasswordReset("alex@example.com")).toEqual({ type: "wait", seconds: 45 });
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("alex@example.com", { redirectTo: "https://store.test/reset-password" });
  });

  test.each(["weak_password", "same_password"])("reports %s as a password error", async (code) => {
    auth.updateUser.mockResolvedValue({ error: { code, message: "Rejected" } });
    const { updatePassword } = await import("./auth");
    expect(await updatePassword("a-long-test-password")).toEqual({ type: "error", message: expect.any(String) });
  });

  test("reports an expired recovery session", async () => {
    auth.updateUser.mockResolvedValue({ error: { code: "session_not_found", message: "Expired" } });
    const { updatePassword } = await import("./auth");
    expect(await updatePassword("a-long-test-password")).toBe("expired");
  });

  test("reports logout failure instead of pretending it succeeded", async () => {
    auth.signOut.mockResolvedValueOnce({ error: new Error("Offline") });
    const { signOutAccount } = await import("./auth");
    expect(await signOutAccount()).toBe("network");
    auth.signOut.mockRejectedValueOnce(new Error("Offline"));
    expect(await signOutAccount()).toBe("network");
    auth.signOut.mockResolvedValueOnce({ error: null });
    expect(await signOutAccount()).toBe("signed-out");
  });
});
