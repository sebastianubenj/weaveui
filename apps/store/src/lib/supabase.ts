import type { SupportedStorage, SupabaseClient } from "@supabase/supabase-js";

const REMEMBER_KEY = "weaveui-auth-remember";

function remembered() {
  return localStorage.getItem(REMEMBER_KEY) !== "0";
}

/** PKCE verifiers must survive a new tab from the email client. */
function isPkceKey(key: string) {
  return key.includes("code-verifier");
}

/** Called before sign-in so the session lands in localStorage or sessionStorage. */
export function setRememberSession(remember: boolean) {
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

const authStorage: SupportedStorage = {
  getItem(key) {
    if (isPkceKey(key)) {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    }
    return (remembered() ? localStorage : sessionStorage).getItem(key);
  },
  setItem(key, value) {
    if (isPkceKey(key)) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
      return;
    }
    const target = remembered() ? localStorage : sessionStorage;
    const other = remembered() ? sessionStorage : localStorage;
    other.removeItem(key);
    target.setItem(key, value);
  },
  removeItem(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

let clientPromise: Promise<SupabaseClient | null> | undefined;

export function getSupabase() {
  if (!clientPromise) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    clientPromise = url && key
      ? import("@supabase/supabase-js").then(({ createClient }) =>
          createClient(url, key, {
            auth: {
              storage: authStorage,
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: false,
              flowType: "pkce",
            },
          }),
        )
      : Promise.resolve(null);
  }

  return clientPromise;
}

export function authRedirect(path: string) {
  return `${window.location.origin}${path}`;
}
