import type { SupportedStorage } from "@supabase/supabase-js";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient }));

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); },
  };
}

beforeEach(() => {
  vi.resetModules();
  createClient.mockClear();
  vi.stubEnv("VITE_SUPABASE_URL", "https://supabase.test");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-public-key");
  vi.stubGlobal("localStorage", memoryStorage());
  vi.stubGlobal("sessionStorage", memoryStorage());
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

async function setupStorage() {
  const module = await import("./supabase");
  const options = createClient.mock.calls[0]?.[2] as { auth: { storage: SupportedStorage } };
  return { storage: options.auth.storage, setRememberSession: module.setRememberSession };
}

test("stores remembered sessions persistently and moves unremembered sessions to the current tab", async () => {
  const { storage, setRememberSession } = await setupStorage();
  setRememberSession(true);
  await storage.setItem("session", "remembered-session");
  expect(localStorage.getItem("session")).toBe("remembered-session");
  setRememberSession(false);
  await storage.setItem("session", "tab-session");
  expect(localStorage.getItem("session")).toBeNull();
  expect(sessionStorage.getItem("session")).toBe("tab-session");
  expect(await storage.getItem("session")).toBe("tab-session");
});

test("keeps email-link PKCE verifiers available to a new tab regardless of remember-me", async () => {
  const { storage, setRememberSession } = await setupStorage();
  setRememberSession(false);
  await storage.setItem("auth-code-verifier", "test-verifier");
  expect(localStorage.getItem("auth-code-verifier")).toBe("test-verifier");
  expect(sessionStorage.getItem("auth-code-verifier")).toBeNull();
  expect(await storage.getItem("auth-code-verifier")).toBe("test-verifier");
});

test("removes sessions from both storage locations when signed out", async () => {
  const { storage } = await setupStorage();
  localStorage.setItem("session", "old-session");
  sessionStorage.setItem("session", "tab-session");
  await storage.removeItem("session");
  expect(localStorage.getItem("session")).toBeNull();
  expect(sessionStorage.getItem("session")).toBeNull();
});
