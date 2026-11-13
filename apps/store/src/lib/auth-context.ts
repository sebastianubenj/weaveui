import * as React from "react";

export interface AuthState {
  ready: boolean;
  loggedIn: boolean;
  linkError: boolean;
  error?: string;
  clearLinkError: () => void;
  logOut: () => Promise<"signed-out" | "network">;
}

export const AuthContext = React.createContext<AuthState>({
  ready: true,
  loggedIn: false,
  linkError: false,
  clearLinkError: () => {},
  logOut: async () => "signed-out",
});

export function useAuth() {
  return React.useContext(AuthContext);
}
