import * as React from "react";

export interface AuthState {
  ready: boolean;
  loggedIn: boolean;
  linkError: boolean;
  error?: string;
  clearLinkError: () => void;
  retry: () => void;
  logOut: () => Promise<"signed-out" | "network">;
}

export const AuthContext = React.createContext<AuthState>({
  ready: true,
  loggedIn: false,
  linkError: false,
  clearLinkError: () => {},
  retry: () => {},
  logOut: async () => "signed-out",
});

export function useAuth() {
  return React.useContext(AuthContext);
}
