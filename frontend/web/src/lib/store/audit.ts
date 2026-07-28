import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditLog } from '../types';

interface AuditState {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'at' | 'ip'>) => void;
  clearLogs: () => void;
}

export const useAudit = create<AuditState>()(
  persist(
    (set) => ({
      logs: [],

      addLog: (data) => {
        const newLog: AuditLog = {
          ...data,
          id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          at: new Date().toISOString(),
          ip: '127.0.0.1',
        };
        set((s) => ({ logs: [newLog, ...s.logs] }));
      },

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'medicore-audit-logs-v2',
    },
  ),
);
