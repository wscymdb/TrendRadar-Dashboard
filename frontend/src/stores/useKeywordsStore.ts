import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Api } from '@/api';

interface KeywordsStore {
  keywordGroups: Record<string, string[]>;
  addKeyword: (group: string, keyword: string) => void;
  removeKeyword: (group: string, keyword: string) => void;
  addGroup: (groupName: string) => void;
  removeGroup: (groupName: string) => void;
  getFormattedText: () => string;
  syncFromBackend: () => Promise<void>;
  saveToBackend: () => Promise<boolean>;
}

export const useKeywordsStore = create<KeywordsStore>()(
  persist(
    (set, get) => ({
      keywordGroups: {},
      addKeyword: (group, keyword) => {
        set((state) => {
          const current = state.keywordGroups[group] || [];
          if (current.includes(keyword.trim())) return state;
          return {
            keywordGroups: {
              ...state.keywordGroups,
              [group]: [...current, keyword.trim()],
            },
          };
        });
        get().saveToBackend();
      },
      removeKeyword: (group, keyword) => {
        set((state) => ({
          keywordGroups: {
            ...state.keywordGroups,
            [group]: (state.keywordGroups[group] || []).filter((k) => k !== keyword),
          },
        }));
        get().saveToBackend();
      },
      addGroup: (groupName) => {
        set((state) => {
          if (state.keywordGroups[groupName.trim()]) return state;
          return {
            keywordGroups: {
              ...state.keywordGroups,
              [groupName.trim()]: [],
            },
          };
        });
        get().saveToBackend();
      },
      removeGroup: (groupName) => {
        set((state) => {
          const next = { ...state.keywordGroups };
          delete next[groupName];
          return { keywordGroups: next };
        });
        get().saveToBackend();
      },
      getFormattedText: () => {
        const groups = get().keywordGroups;
        return Object.entries(groups)
          .map(([group, words]) => `# === ${group} ===\n${words.join(' ')}`)
          .join('\n\n');
      },
      syncFromBackend: async () => {
        const res = await Api.getKeywords();
        if (res.success && res.data?.groups) {
          set({ keywordGroups: res.data.groups });
        }
      },
      saveToBackend: async () => {
        const formatted = get().getFormattedText();
        const res = await Api.saveKeywords(formatted);
        return res.success;
      },
    }),
    {
      name: 'trendradar_keywords_store',
    }
  )
);
