// /src/store/snapshotStore.ts
import { create } from "zustand";
import type { StockItem } from "../types/stock";

export type PeriodType = "day" | "week" | "month" | "year";

export interface SnapshotData {
  volume: StockItem[];
  amount: StockItem[];
  rise: StockItem[];
  fall: StockItem[];
}

interface SnapshotState {
  cache: Record<PeriodType, SnapshotData>;
  setSnapshot: (period: PeriodType, data: SnapshotData) => void;
}

export const useSnapshotStore = create<SnapshotState>((set) => ({
  cache: {
    day:   { volume: [], amount: [], rise: [], fall: [] },
    week:  { volume: [], amount: [], rise: [], fall: [] },
    month: { volume: [], amount: [], rise: [], fall: [] },
    year:  { volume: [], amount: [], rise: [], fall: [] },
  },

  setSnapshot: (period, data) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [period]: data, // 타입 자동 보장됨
      },
    })),
}));
