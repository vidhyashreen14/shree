import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PlanKey = 'monthly' | 'sixMonth' | 'yearly';
export type SubStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Pending';

export interface AdminSubscription {
  id: string;
  /** Email of the admin this subscription belongs to — used as the lookup key */
  adminEmail: string;
  adminName: string;
  clinic: string;
  plan: PlanKey;
  startDate: string; // ISO date string YYYY-MM-DD
  expiryDate: string; // ISO date string YYYY-MM-DD
  status: SubStatus;
}

export interface SubscriptionPlan {
  key: PlanKey;
  name: string;
  duration: string;
  price: number;
  features: string[];
}

// ─── Default plans (editable by superadmin) ──────────────────────────────────

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    key: 'monthly',
    name: 'Monthly Plan',
    duration: '1 Month',
    price: 8500,
    features: [
      'All Core Modules',
      'Up to 10 Doctors',
      'Standard Reports',
      'Email Support',
      '5 Staff Logins',
    ],
  },
  {
    key: 'sixMonth',
    name: '6 Months Plan',
    duration: '6 Months',
    price: 45000,
    features: [
      'All Core Modules',
      'Up to 30 Doctors',
      'Advanced Analytics',
      'Priority Support',
      '20 Staff Logins',
      'Pharmacy Module',
    ],
  },
  {
    key: 'yearly',
    name: 'Yearly Plan',
    duration: '12 Months',
    price: 85000,
    features: [
      'All Modules Included',
      'Unlimited Doctors',
      'Custom Reports',
      '24/7 Dedicated Support',
      'Unlimited Staff Logins',
      'Lab & Radiology',
      'API Access',
    ],
  },
];

// ─── Store ───────────────────────────────────────────────────────────────────

interface SubscriptionsState {
  subscriptions: AdminSubscription[];
  plans: SubscriptionPlan[];
  addSubscription: (sub: Omit<AdminSubscription, 'id'>) => AdminSubscription;
  updateSubscription: (id: string, patch: Partial<AdminSubscription>) => void;
  removeSubscription: (id: string) => void;
  updatePlanPrice: (key: PlanKey, price: number) => void;
  /** Look up the active/latest subscription for a given admin email */
  getForEmail: (email: string) => AdminSubscription | undefined;
}

export const useSubscriptions = create<SubscriptionsState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      plans: DEFAULT_PLANS,

      addSubscription: (data) => {
        const sub: AdminSubscription = {
          ...data,
          id: `SUB-${Date.now()}`,
        };
        set((s) => ({ subscriptions: [sub, ...s.subscriptions] }));
        return sub;
      },

      updateSubscription: (id, patch) =>
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...patch } : sub,
          ),
        })),

      removeSubscription: (id) =>
        set((s) => ({ subscriptions: s.subscriptions.filter((sub) => sub.id !== id) })),

      updatePlanPrice: (key, price) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.key === key ? { ...p, price } : p)),
        })),

      getForEmail: (email) => {
        const email_lower = email.toLowerCase();
        const subs = get().subscriptions.filter(
          (sub) => sub.adminEmail.toLowerCase() === email_lower,
        );
        // Return the most recent active one, then most recent overall
        return (
          subs.find((s) => s.status === 'Active') ||
          subs.find((s) => s.status === 'Expiring Soon') ||
          subs[0]
        );
      },
    }),
    { name: 'medicore-subscriptions' },
  ),
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Compute real-time subscription status based on expiry date */
export function computeStatus(expiryDate: string): SubStatus {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 7) return 'Expiring Soon';
  return 'Active';
}

/** Days remaining (negative if expired) */
export function daysRemaining(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Total duration in days for a plan */
export function planDurationDays(plan: PlanKey): number {
  if (plan === 'monthly') return 30;
  if (plan === 'sixMonth') return 182;
  return 365;
}
