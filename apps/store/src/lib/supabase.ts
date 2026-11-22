import type { SupportedStorage, SupabaseClient } from "@supabase/supabase-js";

// Each tab keeps its own choice. On reload, recover it from the location of
// the existing session; another tab's sign-in cannot change this choice.
let rememberSession: boolean | undefined;

/** PKCE verifiers must survive a new tab from the email client. */
function isPkceKey(key: string) {
  return key.includes("code-verifier");
}

/** Called before sign-in so the session lands in localStorage or sessionStorage. */
export function setRememberSession(remember: boolean) {
  rememberSession = remember;
}

const authStorage: SupportedStorage = {
  getItem(key) {
    if (isPkceKey(key)) {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    }
    const tabSession = sessionStorage.getItem(key);
    if (rememberSession === undefined) rememberSession = tabSession === null;
    return rememberSession ? localStorage.getItem(key) : tabSession;
  },
  setItem(key, value) {
    if (isPkceKey(key)) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
      return;
    }
    const target = rememberSession === false ? sessionStorage : localStorage;
    if (rememberSession !== false) sessionStorage.removeItem(key);
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
