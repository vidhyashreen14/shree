import { create } from "zustand";
import type { Notification } from "../types";

interface NotifState {
  items: Notification[];
  notifications: Notification[];
  markAllRead: () => void;
  push: (n: Omit<Notification, "id" | "at" | "read">) => void;
}

const seed: Notification[] = [
  {
    id: "n1",
    title: "New appointment booked",
    body: "Aarav Sharma — 10:30 AM with Dr. Vikram",
    at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    kind: "info",
    read: false,
  },
  {
    id: "n2",
    title: "Lab report ready",
    body: "CBC for MRN-10231 completed",
    at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    kind: "success",
    read: false,
  },
  {
    id: "n3",
    title: "Low stock alert",
    body: "Amoxicillin 500mg — 12 units remaining",
    at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    kind: "warning",
    read: false,
  },
  {
    id: "n4",
    title: "Patient arrived",
    body: "Token #14 checked in at front desk",
    at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    kind: "info",
    read: true,
  },
  {
    id: "n5",
    title: "Prescription failed to print",
    body: "Printer offline — try again",
    at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    kind: "error",
    read: true,
  },
];

export const useNotifications = create<NotifState>((set) => ({
  items: seed,
  notifications: seed,
  markAllRead: () =>
    set((s) => {
      const updated = s.notifications.map((n) => ({ ...n, read: true }));
      return { items: updated, notifications: updated };
    }),
  push: (n) =>
    set((s) => {
      const updated = [
        { ...n, id: `n${Date.now()}`, at: new Date().toISOString(), read: false },
        ...s.notifications,
      ];
      return { items: updated, notifications: updated };
    }),
}));
