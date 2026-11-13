import * as React from "react";
import type { Session } from "@supabase/supabase-js";

import { consumeAuthCallback, readAuthCode, signOutAccount } from "@/lib/auth";
import { AuthContext } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [ready, setReady] = React.useState(supabase === null);
  const [linkError, setLinkError] = React.useState(false);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (!supabase) return;

    let cancelled = false;
    const code = readAuthCode();
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      // Wait for the email-link exchange before accepting the boot session.
      if (event === "INITIAL_SESSION" && code) return;
      setSession(next);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setError(undefined);
    });

    void (async () => {
      try {
        const result = await consumeAuthCallback();
        if (cancelled) return;

        if (result === "expired") {
          setLinkError(true);
          return;
        }
        if (result === "network") {
          setError("We couldn’t verify this link. Check your connection and reload to try again.");
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (cancelled) return;
        if (sessionError) throw sessionError;
        setSession(sessionData.session);
      } catch {
        if (!cancelled) setError("We couldn’t restore your session. Please try logging in again.");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const logOut = React.useCallback(async () => {
    setError(undefined);
    const result = await signOutAccount();
    if (result === "network") setError("We couldn’t log you out. Please try again.");
    return result;
  }, []);
  const clearLinkError = React.useCallback(() => setLinkError(false), []);

  const value = React.useMemo(
    () => ({
      ready,
      loggedIn: session !== null,
      linkError,
      error,
      clearLinkError,
      logOut,
    }),
    [ready, session, linkError, error, clearLinkError, logOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
