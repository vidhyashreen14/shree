import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Medicine } from '../types';

export interface InvoiceMedicineItem {
  id: number;
  medicine: string;
  category: string;
  batch: string;
  batchExpiry: string;
  unitsPerStrip: string;
  noOfStrips: string;
  freeStrips: string;
  gstTotal: string;
  mrpPerStrip: string;
  discount: string;
  hsnCode: string;
  rackNo: string;
  boxNo: string;
  netPrice: number;
  totalUnits: number;
}

export interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  stockist: string;
  date: string;
  items: InvoiceMedicineItem[];
  totalAmount: number;
  totalGST: number;
  grandTotal: number;
  status: 'paid' | 'pending' | 'refunded';
  patientName?: string;
  patientMRN?: string;
}

export type StockAction = 'add' | 'remove' | 'set' | 'bulk-restock' | 'bulk-undo';

export interface StockHistoryEntry {
  id: string;
  medicineId: string;
  at: string;
  action: StockAction;
  delta: number;
  before: number;
  after: number;
  by: string;
  note?: string;
  batchId?: string;
}

interface PharmacyState {
  inventory: Medicine[];
  invoices: SavedInvoice[];
  stockHistory: StockHistoryEntry[];

  addInvoice: (invoice: SavedInvoice) => void;
  deleteInvoice: (id: string) => void;
  syncItemToInventory: (item: InvoiceMedicineItem, stockist?: string) => void;
  addInventoryItem: (item: Medicine) => void;
  updateInventoryItem: (id: string, updates: Partial<Medicine>) => void;
  deleteInventoryItem: (id: string) => void;
  adjustStock: (id: string, delta: number, action: StockAction, by: string, note?: string) => void;
  setInventory: (items: Medicine[]) => void;
}

export const usePharmacyStore = create<PharmacyState>()(
  persist(
    (set, get) => ({
      inventory: [],
      invoices: [],
      stockHistory: [],

      setInventory: (items) => set({ inventory: items }),

      deleteInvoice: (id: string) => {
        set((state) => ({
          invoices: state.invoices.filter((i) => i.id !== id),
        }));
      },

      syncItemToInventory: (item: InvoiceMedicineItem, stockist?: string) => {
        set((state) => {
          const updatedInventory = [...state.inventory];
          const addedStock = item.totalUnits || (parseInt(item.noOfStrips || '0') * parseInt(item.unitsPerStrip || '0')) || 0;
          const existingIndex = updatedInventory.findIndex(
            (m) =>
              m.name.trim().toLowerCase() === item.medicine.trim().toLowerCase() &&
              m.batch.trim().toLowerCase() === item.batch.trim().toLowerCase()
          );

          const unitsPerStripNum = parseFloat(item.unitsPerStrip) || 1;
          const mrpNum = parseFloat(item.mrpPerStrip) || 0;
          const pricePerUnit = unitsPerStripNum > 0 ? parseFloat((mrpNum / unitsPerStripNum).toFixed(2)) : mrpNum;

          if (existingIndex >= 0) {
            const existing = updatedInventory[existingIndex]!;
            updatedInventory[existingIndex] = {
              ...existing,
              category: item.category || existing.category || 'General',
              stock: existing.stock + addedStock,
              expiry: item.batchExpiry || existing.expiry,
              pricePerUnit: pricePerUnit || existing.pricePerUnit,
              gst: parseFloat(item.gstTotal) || existing.gst,
              manufacturer: stockist || existing.manufacturer,
              createdAt: new Date().toISOString(),
            };
          } else {
            const newMedId = `med-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newMed: Medicine = {
              id: newMedId,
              name: item.medicine,
              category: item.category || 'General',
              manufacturer: stockist || 'General Stockist',
              stock: addedStock,
              minStock: 10,
              expiry: item.batchExpiry || '',
              pricePerUnit: pricePerUnit,
              gst: parseFloat(item.gstTotal) || 0,
              batch: item.batch,
              ingredients: `HSN: ${item.hsnCode || 'N/A'}, Rack: ${item.rackNo || 'N/A'}, Box: ${item.boxNo || 'N/A'}`,
              createdAt: new Date().toISOString(),
            };
            updatedInventory.unshift(newMed);
          }
          return { inventory: updatedInventory };
        });
      },

      addInvoice: (invoice: SavedInvoice) => {
        set((state) => {
          const newInvoices = [invoice, ...state.invoices];
          const updatedInventory = [...state.inventory];
          const nowStr = new Date().toISOString();
          const newHistoryEntries: StockHistoryEntry[] = [];

          invoice.items.forEach((item) => {
            const addedStock = item.totalUnits || (parseInt(item.noOfStrips || '0') * parseInt(item.unitsPerStrip || '0')) || 0;
            const existingIndex = updatedInventory.findIndex(
              (m) =>
                m.name.trim().toLowerCase() === item.medicine.trim().toLowerCase() &&
                m.batch.trim().toLowerCase() === item.batch.trim().toLowerCase()
            );

            const unitsPerStripNum = parseFloat(item.unitsPerStrip) || 1;
            const mrpNum = parseFloat(item.mrpPerStrip) || 0;
            const pricePerUnit = unitsPerStripNum > 0 ? parseFloat((mrpNum / unitsPerStripNum).toFixed(2)) : mrpNum;

            if (existingIndex >= 0) {
              const existing = updatedInventory[existingIndex]!;
              const beforeStock = existing.stock;
              const afterStock = beforeStock + addedStock;

              updatedInventory[existingIndex] = {
                ...existing,
                category: item.category || existing.category || 'General',
                stock: afterStock,
                expiry: item.batchExpiry || existing.expiry,
                pricePerUnit: pricePerUnit || existing.pricePerUnit,
                gst: parseFloat(item.gstTotal) || existing.gst,
                manufacturer: invoice.stockist || existing.manufacturer,
                createdAt: nowStr,
              };

              newHistoryEntries.push({
                id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                medicineId: existing.id,
                at: nowStr,
                action: 'add',
                delta: addedStock,
                before: beforeStock,
                after: afterStock,
                by: 'Invoice Entry',
                note: `Added via Invoice #${invoice.invoiceNumber}`,
                batchId: item.batch,
              });
            } else {
              const newMedId = `med-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
              const newMed: Medicine = {
                id: newMedId,
                name: item.medicine,
                category: item.category || 'General',
                manufacturer: invoice.stockist || 'General Stockist',
                stock: addedStock,
                minStock: 10,
                expiry: item.batchExpiry || '',
                pricePerUnit: pricePerUnit,
                gst: parseFloat(item.gstTotal) || 0,
                batch: item.batch,
                ingredients: `HSN: ${item.hsnCode || 'N/A'}, Rack: ${item.rackNo || 'N/A'}, Box: ${item.boxNo || 'N/A'}`,
                createdAt: nowStr,
              };

              updatedInventory.unshift(newMed);

              newHistoryEntries.push({
                id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                medicineId: newMedId,
                at: nowStr,
                action: 'add',
                delta: addedStock,
                before: 0,
                after: addedStock,
                by: 'Invoice Entry',
                note: `Added new stock via Invoice #${invoice.invoiceNumber}`,
                batchId: item.batch,
              });
            }
          });

          return {
            invoices: newInvoices,
            inventory: updatedInventory,
            stockHistory: [...newHistoryEntries, ...state.stockHistory],
          };
        });
      },

      addInventoryItem: (item) => {
        set((state) => ({
          inventory: [{ ...item, createdAt: item.createdAt || new Date().toISOString() }, ...state.inventory],
        }));
      },

      updateInventoryItem: (id, updates) => {
        set((state) => ({
          inventory: state.inventory.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }));
      },

      deleteInventoryItem: (id) => {
        set((state) => ({
          inventory: state.inventory.filter((m) => m.id !== id),
        }));
      },

      adjustStock: (id, delta, action, by, note) => {
        set((state) => {
          const item = state.inventory.find((m) => m.id === id);
          if (!item) return state;

          const before = item.stock;
          const after = action === 'set' ? delta : Math.max(0, before + delta);
          const actualDelta = after - before;

          const newHistory: StockHistoryEntry = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            medicineId: id,
            at: new Date().toISOString(),
            action,
            delta: actualDelta,
            before,
            after,
            by,
            note,
          };

          return {
            inventory: state.inventory.map((m) => (m.id === id ? { ...m, stock: after } : m)),
            stockHistory: [newHistory, ...state.stockHistory],
          };
        });
      },
    }),
    {
      name: 'hms-pharmacy-store-v4',
    }
  )
);
