import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { fn } from "storybook/test";

export const exampleSession: Session = {
  access_token: "test-access-token", refresh_token: "test-refresh-token",
  expires_in: 3600, token_type: "bearer",
  user: {
    id: "test-user", aud: "authenticated", role: "authenticated",
    email: "alex@example.com", app_metadata: {}, user_metadata: {},
    created_at: "2026-01-01T00:00:00Z",
  },
};

// Storybook replaces the module before evaluation, so no real client or requests are created.
export const supabase = {
  auth: {
    getSession: fn(), onAuthStateChange: fn(), exchangeCodeForSession: fn(),
    signInWithPassword: fn(), signUp: fn(), resetPasswordForEmail: fn(),
    resend: fn(), updateUser: fn(), signOut: fn(),
  },
} as unknown as SupabaseClient;
export const setRememberSession = fn();
export const authRedirect = (path: string) => `${window.location.origin}${path}`;
