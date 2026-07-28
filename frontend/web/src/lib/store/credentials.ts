import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "../types";

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  /** btoa(password) — demo-safe obfuscation */
  passwordHash: string;
  role: Role;
  department: string;
  status: "active" | "suspended";
  createdAt: string;
  lastLogin?: string;
}

interface CredentialState {
  accounts: StaffAccount[];
  addAccount: (account: Omit<StaffAccount, "id" | "createdAt" | "status">) => StaffAccount;
  updateAccount: (id: string, patch: Partial<StaffAccount>) => void;
  suspendAccount: (id: string) => void;
  reactivateAccount: (id: string) => void;
  resetPassword: (id: string, newPassword: string) => void;
  deleteAccount: (id: string) => void;
  getByEmail: (email: string) => StaffAccount | undefined;
  validateCredentials: (email: string, password: string, role: Role) => StaffAccount | null;
}

export const useCredentials = create<CredentialState>()(
  persist(
    (set, get) => ({
      accounts: [],

      addAccount: (data) => {
        const account: StaffAccount = {
          ...data,
          id: `staff-${Date.now()}`,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ accounts: [account, ...s.accounts] }));
        return account;
      },

      updateAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      suspendAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, status: "suspended" } : a)),
        })),

      reactivateAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, status: "active" } : a)),
        })),

      resetPassword: (id, newPassword) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === id ? { ...a, passwordHash: btoa(newPassword) } : a
          ),
        })),

      deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      getByEmail: (email) =>
        get().accounts.find((a) => a.email.toLowerCase() === email.toLowerCase()),

      validateCredentials: (email, password, role) => {
        const account = get().getByEmail(email);
        if (
          account &&
          account.passwordHash === btoa(password) &&
          account.role === role &&
          account.status === "active"
        ) {
          // update last login
          set((s) => ({
            accounts: s.accounts.map((a) =>
              a.id === account.id ? { ...a, lastLogin: new Date().toISOString() } : a
            ),
          }));
          return account;
        }
        return null;
      },
    }),
    { name: "medicore-credentials" }
  )
);
