import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "../types";
import { ROLES } from "../rbac";

const DEMO_USERS: Record<Role, User> = {
  admin: { id: "u-admin", name: "Dr. Anika Rao", email: "admin@medicore.io", role: "admin", department: "Administration" },
  doctor: { id: "u-doc-1", name: "Dr. Vikram Shah", email: "doctor@medicore.io", role: "doctor", department: "Cardiology" },
  frontdesk: { id: "u-fd", name: "Priya Menon", email: "frontdesk@medicore.io", role: "frontdesk", department: "Reception" },
  nurse: { id: "u-rn", name: "Sister Joan Lewis", email: "nurse@medicore.io", role: "nurse", department: "OPD" },
  pharmacy: { id: "u-rx", name: "Rahul Verma", email: "pharmacy@medicore.io", role: "pharmacy", department: "Pharmacy" },
  lab: { id: "u-lab", name: "Mei Chen", email: "lab@medicore.io", role: "lab", department: "Pathology" },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, _password: string, role: Role) => Promise<User>;
  login: (email: string, role: Role) => Promise<User>;
  signOut: () => void;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      signIn: async (email, _password, role) => {
        await new Promise((r) => setTimeout(r, 400));
        const base = DEMO_USERS[role];
        const user: User = { ...base, email: email || base.email };
        set({ user, isAuthenticated: true });
        return user;
      },
      login: async (email, role) => {
        const base = DEMO_USERS[role];
        const user: User = { ...base, email: email || base.email };
        set({ user, isAuthenticated: true });
        return user;
      },
      signOut: () => set({ user: null, isAuthenticated: false }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
    }),
    { name: "medicore-auth" },
  ),
);

export { ROLES };
