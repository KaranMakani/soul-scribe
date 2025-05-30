// context/auth-context.tsx
import { createContext, useContext } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  nearWallet: string | null;
  login: (wallet: string, address: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthContext.Provider");
  }
  return ctx;
}
