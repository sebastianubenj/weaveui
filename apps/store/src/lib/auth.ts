import type { AuthError } from "@supabase/supabase-js";

import { authRedirect, getSupabase, setRememberSession } from "@/lib/supabase";

export type AuthFormError = { type: "error"; message: string };
export type RegisterAuthResult = "network" | "confirm-email" | "signed-in" | AuthFormError;
export type LoginAuthResult =
  | "network"
  | "invalid-credentials"
  | "email-not-confirmed"
  | "signed-in"
  | AuthFormError;
export type ForgotAuthResult =
  | "network"
  | "sent"
  | {
      type: "wait";
      seconds?: number;
    };
export type ResetAuthResult = "network" | "updated" | "expired" | AuthFormError;
export type ConfirmEmailAuthResult =
  | "network"
  | "sent"
  | {
      type: "wait";
      seconds?: number;
    };

function isNetwork(error: AuthError) {
  return (
    error.name === "AuthRetryableFetchError" ||
    error.status === 0 ||
    /failed to fetch|network|load failed/i.test(error.message)
  );
}

function isRateLimit(error: AuthError) {
  return (
    error.code === "over_email_send_rate_limit" ||
    error.code === "over_request_rate_limit" ||
    /rate limit|only request this after/i.test(error.message)
  );
}

function formError(error: AuthError): AuthFormError {
  let message = "Something went wrong. Please try again.";
  if (isRateLimit(error)) message = "Too many attempts. Please wait before trying again.";
  if (error.code === "weak_password") {
    message = "This password doesn’t meet the account’s security requirements. Choose a stronger password.";
  }
  if (error.code === "same_password") message = "Choose a password different from your current password.";
  if (error.code === "email_address_invalid") message = "Enter a valid email address.";
  if (error.code === "reauthentication_needed" || error.code === "reauthentication_not_valid") {
    message = "Please request a new password reset link to continue.";
  }
  return { type: "error", message };
}

export function readAuthLinkError() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return search.get("error_code") ?? hash.get("error_code") ?? search.get("error") ?? hash.get("error");
}

export function readAuthCode() {
  return new URLSearchParams(window.location.search).get("code");
}

function stripAuthCode() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  const search = url.searchParams.toString();
  window.history.replaceState({}, "", `${url.pathname}${search ? `?${search}` : ""}`);
}

type AuthCallbackResult = "ok" | "expired" | "none" | "network";
let authCallbackExchange: Promise<AuthCallbackResult> | null = null;
let authCallbackCode: string | null = null;

/**
 * Exchanges the email-link code once. Shared across StrictMode remounts so the
 * one-time code is not consumed twice. `detectSessionInUrl` stays off.
 */
export async function consumeAuthCallback(): Promise<AuthCallbackResult> {
  const supabase = await getSupabase();
  if (!supabase) return "none";
  if (readAuthLinkError()) return "expired";

  const code = readAuthCode();
  if (!code) return "none";

  if (authCallbackExchange && authCallbackCode === code) return authCallbackExchange;

  authCallbackCode = code;
  const exchange = (async (): Promise<AuthCallbackResult> => {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error && isNetwork(error)) return "network";
    stripAuthCode();
    return error ? "expired" : "ok";
  })();
  authCallbackExchange = exchange;
  try {
    return await exchange;
  } finally {
    // Share only an in-flight exchange. Reopening a consumed code must validate it again.
    if (authCallbackExchange === exchange) {
      authCallbackExchange = null;
      authCallbackCode = null;
    }
  }
}

export async function registerAccount(values: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterAuthResult> {
  const supabase = await getSupabase();
  if (!supabase) return "network";

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: { full_name: values.name },
      emailRedirectTo: authRedirect("/login"),
    },
  });

  if (error) {
    if (isNetwork(error)) return "network";
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
      return "confirm-email";
    }
    return formError(error);
  }

  if ((data.user?.identities?.length ?? 0) === 0 || !data.session) return "confirm-email";
  return "signed-in";
}

export async function signInAccount(values: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<LoginAuthResult> {
  const supabase = await getSupabase();
  if (!supabase) return "network";

  setRememberSession(values.rememberMe);
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (!error) return "signed-in";
  if (isNetwork(error)) return "network";
  if (error.code === "email_not_confirmed" || /email not confirmed/i.test(error.message)) return "email-not-confirmed";
  if (error.code === "invalid_credentials") return "invalid-credentials";
  return formError(error);
}

export async function requestPasswordReset(email: string): Promise<ForgotAuthResult> {
  const supabase = await getSupabase();
  if (!supabase) return "network";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authRedirect("/reset-password"),
  });

  if (!error) return "sent";
  if (isRateLimit(error)) {
    const seconds = error.message.match(/after (\d+) seconds?/i);
    if (seconds) return { type: "wait", seconds: Number(seconds[1]) };
    return { type: "wait" };
  }
  if (isNetwork(error)) return "network";
  return "network";
}

export async function updatePassword(password: string): Promise<ResetAuthResult> {
  const supabase = await getSupabase();
  if (!supabase) return "network";

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (isNetwork(error)) return "network";
    if (error.name === "AuthSessionMissingError" || error.code === "session_not_found" || error.code === "session_expired") return "expired";
    return formError(error);
  }

  // Do not sign out here: ResetPasswordRoute treats a mid-submit logout as an
  // expired recovery link and navigates away from /password-updated.
  return "updated";
}

export async function resendConfirmationEmail(
  email: string,
): Promise<ConfirmEmailAuthResult> {
  const supabase = await getSupabase();
  if (!supabase) return "network";

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: authRedirect("/login"),
    },
  });

  if (!error) return "sent";
  if (isRateLimit(error)) {
    const seconds = error.message.match(/after (\d+) seconds?/i);
    if (seconds) return { type: "wait", seconds: Number(seconds[1]) };
    return { type: "wait" };
  }
  if (isNetwork(error)) return "network";
  return "network";
}

export async function signOutAccount(): Promise<"signed-out" | "network"> {
  const supabase = await getSupabase();
  if (!supabase) return "signed-out";
  try {
    const { error } = await supabase.auth.signOut();
    return error ? "network" : "signed-out";
  } catch {
    return "network";
  }
}
