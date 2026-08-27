import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Api } from '@/api';

export interface ParsedFrequencyWords {
  globalFilters: string[];
  groups: Record<string, string[]>;
}

export const parseFrequencyWordsText = (rawText: string): ParsedFrequencyWords => {
  const groups: Record<string, string[]> = {};
  const globalFilters: string[] = [];
  let inGlobalFilter = false;
  let currentGroup = '企业与品牌';

  const lines = rawText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 过滤纯分割线（如 # ════ 或 # ────）
    if (/^[#\s═─━=\-_~*]+$/.test(trimmed)) continue;

    // 忽略说明区
    if (
      trimmed.includes('Version:') ||
      trimmed.includes('可视化配置编辑器') ||
      trimmed.includes('语法总览') ||
      trimmed.includes('基础用法') ||
      trimmed.includes('进阶用法') ||
      trimmed.includes('使用方法') ||
      trimmed.includes('在这里写入')
    ) {
      continue;
    }

    if (trimmed.startsWith('[GLOBAL_FILTER]')) {
      inGlobalFilter = true;
      continue;
    } else if (trimmed.startsWith('[WORD_GROUPS]')) {
      inGlobalFilter = false;
      continue;
    }

    // 处于黑名单区域
    if (inGlobalFilter) {
      if (!trimmed.startsWith('#')) {
        const words = trimmed.split(/[\s,，;；|/]+/).map((w) => w.trim()).filter(Boolean);
        for (const w of words) {
          if (!globalFilters.includes(w)) {
            globalFilters.push(w);
          }
        }
      }
      continue;
    }

    // 处于白名单区域：解析大标题注释：# 企业与品牌 或 [中国]
    if (trimmed.startsWith('#') && !trimmed.startsWith('#!')) {
      const cleanTitle = trimmed.replace(/^[#\s═─━=\-_~*]+/, '').replace(/[#\s═─━=\-_~*]+$/, '').trim();
      if (
        cleanTitle &&
        cleanTitle.length <= 25 &&
        !cleanTitle.includes('过滤') &&
        !cleanTitle.includes('标题党') &&
        !cleanTitle.includes('GLOBAL') &&
        !cleanTitle.includes('http') &&
        !cleanTitle.includes('凡是') &&
        !cleanTitle.includes('文件分为') &&
        !cleanTitle.includes('关键词语法') &&
        !cleanTitle.includes('显示名称') &&
        !cleanTitle.includes('效果：') &&
        !cleanTitle.includes('说明：')
      ) {
        currentGroup = cleanTitle;
        if (!groups[currentGroup]) groups[currentGroup] = [];
        continue;
      }
    } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const gName = trimmed.slice(1, -1).trim();
      if (gName && gName !== 'WORD_GROUPS' && gName !== 'GLOBAL_FILTER' && !gName.includes('过滤')) {
        currentGroup = gName;
        if (!groups[currentGroup]) groups[currentGroup] = [];
        continue;
      }
    }

    if (trimmed.startsWith('!')) continue; // 排除词跳过

    // 解析形如 /正则/ => 显示别名
    let wordToAdd = trimmed;
    if (trimmed.includes('=>')) {
      wordToAdd = trimmed.split('=>')[1].trim();
    } else if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
      wordToAdd = trimmed.replace(/^\/|\/$/g, '').trim();
    }

    if (wordToAdd) {
      if (!groups[currentGroup]) groups[currentGroup] = [];
      const subWords = wordToAdd.split(/[\s,，;；|]+/).map((w) => w.trim()).filter(Boolean);
      for (const sw of subWords) {
        if (!groups[currentGroup].includes(sw)) {
          groups[currentGroup].push(sw);
        }
      }
    }
  }

  // 清除空分类
  const cleanResult: Record<string, string[]> = {};
  for (const [g, words] of Object.entries(groups)) {
    if (words.length > 0) {
      cleanResult[g] = words;
    }
  }

  return {
    globalFilters: globalFilters.length > 0 ? globalFilters : ['震惊'],
    groups: Object.keys(cleanResult).length > 0 ? cleanResult : { '默认关注词': [] },
  };
};

export const formatFrequencyWordsText = (
  globalFilters: string[],
  groups: Record<string, string[]>
): string => {
  let output = `# ═══════════════════════════════════════════════════════════════\n#                    TrendRadar 频率词配置文件\n# ═══════════════════════════════════════════════════════════════\n\n`;

  // 1. 全局过滤区
  output += `[GLOBAL_FILTER]\n# 过滤标题党与低质噪音 (命中直接丢弃拦截)\n`;
  output += globalFilters.join('\n') + `\n\n`;

  // 2. 词组定义区
  output += `# ═══════════════════════════════════════════════════════════════\n#                        关注词组定义区\n# ═══════════════════════════════════════════════════════════════\n\n[WORD_GROUPS]\n\n`;

  const groupBlocks = Object.entries(groups)
    .filter(([_, words]) => words.length > 0)
    .map(([group, words]) => `# === ${group} ===\n${words.join(' ')}`)
    .join('\n\n');

  return output + groupBlocks;
};

interface KeywordsStore {
  globalFilters: string[];
  keywordGroups: Record<string, string[]>;
  rawText: string;

  // 黑名单操作
  addGlobalFilter: (keyword: string) => void;
  addGlobalFilters: (keywords: string[]) => void;
  removeGlobalFilter: (keyword: string) => void;
  clearGlobalFilters: () => void;

  // 白名单关注词操作
  addKeyword: (group: string, keyword: string) => void;
  addKeywords: (group: string, keywords: string[]) => void;
  removeKeyword: (group: string, keyword: string) => void;
  addGroup: (groupName: string) => void;
  renameGroup: (oldName: string, newName: string) => void;
  removeGroup: (groupName: string) => void;
  clearGroup: (groupName: string) => void;

  setRawText: (text: string) => void;
  getFormattedText: () => string;
  syncFromBackend: () => Promise<void>;
  saveToBackend: () => Promise<{ success: boolean; message: string }>;
  resetToDefault: () => Promise<{ success: boolean; message: string }>;
}

export const useKeywordsStore = create<KeywordsStore>()(
  persist(
    (set, get) => ({
      globalFilters: ['震惊'],
      keywordGroups: {},
      rawText: '',

      addGlobalFilter: (keyword) => {
        get().addGlobalFilters([keyword]);
      },
      addGlobalFilters: (keywords) => {
        set((state) => {
          const current = state.globalFilters || [];
          const cleanWords = keywords
            .map((w) => w.trim())
            .filter((w) => w && !current.includes(w));
          if (cleanWords.length === 0) return state;

          const nextFilters = [...current, ...cleanWords];
          return {
            globalFilters: nextFilters,
            rawText: formatFrequencyWordsText(nextFilters, state.keywordGroups),
          };
        });
      },
      removeGlobalFilter: (keyword) => {
        set((state) => {
          const nextFilters = (state.globalFilters || []).filter((w) => w !== keyword);
          return {
            globalFilters: nextFilters,
            rawText: formatFrequencyWordsText(nextFilters, state.keywordGroups),
          };
        });
      },
      clearGlobalFilters: () => {
        set((state) => ({
          globalFilters: [],
          rawText: formatFrequencyWordsText([], state.keywordGroups),
        }));
      },

      addKeyword: (group, keyword) => {
        get().addKeywords(group, [keyword]);
      },
      addKeywords: (group, keywords) => {
        set((state) => {
          const current = state.keywordGroups[group] || [];
          const cleanWords = keywords
            .map((w) => w.trim())
            .filter((w) => w && !current.includes(w));
          if (cleanWords.length === 0) return state;

          const nextGroups = {
            ...state.keywordGroups,
            [group]: [...current, ...cleanWords],
          };
          return {
            keywordGroups: nextGroups,
            rawText: formatFrequencyWordsText(state.globalFilters, nextGroups),
          };
        });
      },
      removeKeyword: (group, keyword) => {
        set((state) => {
          const nextGroups = {
            ...state.keywordGroups,
            [group]: (state.keywordGroups[group] || []).filter((k) => k !== keyword),
          };
          return {
            keywordGroups: nextGroups,
            rawText: formatFrequencyWordsText(state.globalFilters, nextGroups),
          };
        });
      },
      addGroup: (groupName) => {
        set((state) => {
          const name = groupName.trim();
          if (!name || state.keywordGroups[name]) return state;
          const nextGroups = {
            ...state.keywordGroups,
            [name]: [],
          };
          return {
            keywordGroups: nextGroups,
            rawText: formatFrequencyWordsText(state.globalFilters, nextGroups),
          };
        });
      },
      renameGroup: (oldName, newName) => {
        set((state) => {
          const targetName = newName.trim();
          if (!targetName || targetName === oldName || state.keywordGroups[targetName]) return state;
          const words = state.keywordGroups[oldName] || [];
          const nextGroups = { ...state.keywordGroups };
          delete nextGroups[oldName];
          nextGroups[targetName] = words;
          return {
            keywordGroups: nextGroups,
            rawText: formatFrequencyWordsText(state.globalFilters, nextGroups),
          };
        });
      },
      removeGroup: (groupName) => {
        set((state) => {
          const nextGroups = { ...state.keywordGroups };
          delete nextGroups[groupName];
          return {
            keywordGroups: nextGroups,
            rawText: formatFrequencyWordsText(state.globalFilters, nextGroups),
          };
        });
      },
      clearGroup: (groupName) => {
        set((state) => {
          const nextGroups = {
            ...state.keywordGroups,
            [groupName]: [],
          };
          return {
            keywordGroups: nextGroups,
            rawText: formatFrequencyWordsText(state.globalFilters, nextGroups),
          };
        });
      },
      setRawText: (text) => {
        const parsed = parseFrequencyWordsText(text);
        set({
          rawText: text,
          globalFilters: parsed.globalFilters,
          keywordGroups: parsed.groups,
        });
      },
      getFormattedText: () => {
        const s = get();
        return formatFrequencyWordsText(s.globalFilters, s.keywordGroups);
      },
      syncFromBackend: async () => {
        const res = await Api.getKeywords();
        if (res.success && res.data) {
          const raw = res.data.rawText || '';
          const parsed = parseFrequencyWordsText(raw);
          const filters = res.data.globalFilters || parsed.globalFilters;
          const groups = { ...(res.data.groups || parsed.groups) };
          // 彻底剔除黑名单误入的键
          for (const key of Object.keys(groups)) {
            if (key.includes('过滤') || key.includes('标题党') || key.includes('GLOBAL')) {
              delete groups[key];
            }
          }
          set({
            globalFilters: filters,
            keywordGroups: groups,
            rawText: raw || formatFrequencyWordsText(filters, groups),
          });
        }
      },
      saveToBackend: async () => {
        const formatted = get().getFormattedText();
        const res = await Api.saveKeywords(formatted);
        return {
          success: res.success,
          message: res.message || (res.success ? '关键词与黑名单规则已成功持久化写入 frequency_words.txt！' : '保存失败，请检查网络'),
        };
      },
      resetToDefault: async () => {
        const res = await Api.resetKeywords();
        if (res.success) {
          await get().syncFromBackend();
          return {
            success: true,
            message: res.message || '已成功恢复为官方默认关键词词库！',
          };
        }
        return {
          success: false,
          message: res.message || '重置失败，请检查网络或后端状态',
        };
      },
    }),
    {
      name: 'trendradar_keywords_store',
    }
  )
);
