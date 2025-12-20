import { create } from "zustand";
import { fetchVolumeRankTop10, type VolumeRankItem } from "../api/volumeRankApi";

interface VolumeRankState {
  top10: VolumeRankItem[];
  loading: boolean;
  fetchTop10: () => Promise<void>;
}

export const useVolumeRankStore = create<VolumeRankState>((set) => ({
  top10: [],
  loading: false,

  fetchTop10: async () => {
    try {
      set({ loading: true });

      const data = await fetchVolumeRankTop10();

      set({
        top10: data,
        loading: false,
      });
    } catch (err) {
      console.error("❌ Zustand fetchTop10 오류:", err);
      set({ loading: false });
    }
  },
}));
