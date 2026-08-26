import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_KEYWORD_GROUPS } from '@/mock/initialData';

interface KeywordsStore {
  keywordGroups: Record<string, string[]>;
  addKeyword: (group: string, keyword: string) => void;
  removeKeyword: (group: string, keyword: string) => void;
  addGroup: (groupName: string) => void;
  removeGroup: (groupName: string) => void;
  getFormattedText: () => string;
}

export const useKeywordsStore = create<KeywordsStore>()(
  persist(
    (set, get) => ({
      keywordGroups: INITIAL_KEYWORD_GROUPS,
      addKeyword: (group, keyword) =>
        set((state) => {
          const current = state.keywordGroups[group] || [];
          if (current.includes(keyword.trim())) return state;
          return {
            keywordGroups: {
              ...state.keywordGroups,
              [group]: [...current, keyword.trim()],
            },
          };
        }),
      removeKeyword: (group, keyword) =>
        set((state) => ({
          keywordGroups: {
            ...state.keywordGroups,
            [group]: (state.keywordGroups[group] || []).filter((k) => k !== keyword),
          },
        })),
      addGroup: (groupName) =>
        set((state) => {
          if (state.keywordGroups[groupName.trim()]) return state;
          return {
            keywordGroups: {
              ...state.keywordGroups,
              [groupName.trim()]: [],
            },
          };
        }),
      removeGroup: (groupName) =>
        set((state) => {
          const next = { ...state.keywordGroups };
          delete next[groupName];
          return { keywordGroups: next };
        }),
      getFormattedText: () => {
        const groups = get().keywordGroups;
        return Object.entries(groups)
          .map(([group, words]) => `# === ${group} ===\n${words.join(' ')}`)
          .join('\n\n');
      },
    }),
    {
      name: 'trendradar_keywords_store',
    }
  )
);
