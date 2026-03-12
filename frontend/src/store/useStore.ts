import { create } from 'zustand';
import type { Problem, ProblemListItem, TestResult, ChatMessage, Collection, UserProfile, SolvedRecord } from '../types/problem';
import { getTreeStageInfo } from '../components/GrowthTree/treeUtils';

interface TeachingSection {
  title: string;
  content: string;
}

interface TeachingStorage {
  version: 2;
  difficulty: string;
  sections: TeachingSection[];
}

interface AppState {
  // Problem list
  problems: ProblemListItem[];
  setProblems: (problems: ProblemListItem[]) => void;

  // Current problem
  currentProblem: Problem | null;
  setCurrentProblem: (problem: Problem | null) => void;

  // Editor
  code: string;
  setCode: (code: string) => void;

  // Execution
  output: string;
  setOutput: (output: string) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;

  // Test results
  testResults: TestResult[];
  setTestResults: (results: TestResult[]) => void;

  // AI Chat
  chatMessages: ChatMessage[];
  chatProblemId: number | null;
  addChatMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  clearChat: () => void;
  loadChatForProblem: (problemId: number) => void;
  saveChatMessages: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  setIsChatOpen: (open: boolean) => void;
  isAILoading: boolean;
  setIsAILoading: (loading: boolean) => void;

  // Pyodide
  pyodideReady: boolean;
  setPyodideReady: (ready: boolean) => void;

  // Filters
  difficultyFilter: string;
  categoryFilter: string;
  setDifficultyFilter: (f: string) => void;
  setCategoryFilter: (f: string) => void;

  // Hints
  hints: { level: number; content: string }[];
  hintProblemId: number | null;
  isHintLoading: boolean;
  showHintNudge: boolean;
  consecutiveFailures: number;
  addHint: (level: number) => void;
  updateLastHint: (content: string) => void;
  setLastHintLevel: (level: number) => void;
  loadHintsForProblem: (problemId: number) => void;
  saveHints: () => void;
  triggerHintNudge: () => void;
  dismissHintNudge: () => void;
  incrementFailures: () => void;
  resetFailures: () => void;
  setIsHintLoading: (loading: boolean) => void;
  hasAllLevels: () => boolean;
  clearHints: () => void;

  // Error jump (smart navigation to teaching sections)
  errorJumpTarget: { sectionIndex: number; errorType: string } | null;
  setErrorJumpTarget: (target: { sectionIndex: number; errorType: string } | null) => void;
  dismissErrorJump: () => void;

  // Collections
  collections: Collection[];
  collectionFilter: string;
  loadCollections: () => void;
  createCollection: (name: string) => Collection;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addProblemToCollection: (collectionId: string, problemId: number) => void;
  removeProblemFromCollection: (collectionId: string, problemId: number) => void;
  getCollectionsForProblem: (problemId: number) => Collection[];
  setCollectionFilter: (id: string) => void;

  // User profile
  userProfile: UserProfile | null;
  loadProfile: () => void;
  saveProfile: (profile: UserProfile) => void;

  // Teaching mode
  teachingSections: TeachingSection[];
  teachingDifficulty: string;
  currentSection: number;
  isTeachingLoading: boolean;
  teachingProblemId: number | null;
  addTeachingSection: (title: string) => void;
  updateLastSection: (content: string) => void;
  updateSectionContent: (index: number, content: string) => void;
  initTeachingSections: (titles: string[], difficulty?: string) => void;
  setCurrentSection: (section: number) => void;
  clearTeaching: () => void;
  loadTeachingForProblem: (problemId: number) => void;
  saveTeaching: () => void;
  setIsTeachingLoading: (loading: boolean) => void;

  // Growth tree
  solvedRecords: SolvedRecord[];
  treeJustGrew: boolean;
  loadTreeProgress: () => void;
  markProblemSolved: (problemId: number, title: string, difficulty: 'Easy' | 'Medium' | 'Hard') => void;
  dismissTreeGrowth: () => void;
}

function saveChatToStorage(problemId: number, messages: ChatMessage[]) {
  localStorage.setItem(`chat_${problemId}`, JSON.stringify(messages));
}

function loadChatFromStorage(problemId: number): ChatMessage[] {
  try {
    const stored = localStorage.getItem(`chat_${problemId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTeachingToStorage(problemId: number, sections: TeachingSection[], difficulty: string) {
  const data: TeachingStorage = { version: 2, difficulty, sections };
  localStorage.setItem(`teaching_${problemId}`, JSON.stringify(data));
}

function loadTeachingFromStorage(problemId: number): { sections: TeachingSection[]; difficulty: string } {
  try {
    const stored = localStorage.getItem(`teaching_${problemId}`);
    if (!stored) return { sections: [], difficulty: 'Medium' };
    const parsed = JSON.parse(stored);
    // v2 format: { version: 2, difficulty, sections }
    if (parsed && parsed.version === 2) {
      return { sections: parsed.sections || [], difficulty: parsed.difficulty || 'Medium' };
    }
    // Legacy format: plain array — auto-migrate
    if (Array.isArray(parsed)) {
      return { sections: parsed, difficulty: 'Medium' };
    }
    return { sections: [], difficulty: 'Medium' };
  } catch {
    return { sections: [], difficulty: 'Medium' };
  }
}

function saveCollectionsToStorage(collections: Collection[]) {
  localStorage.setItem('collections', JSON.stringify({ version: 1, collections }));
}

function loadCollectionsFromStorage(): Collection[] {
  try {
    const stored = localStorage.getItem('collections');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (parsed && parsed.version === 1) {
      return parsed.collections || [];
    }
    return [];
  } catch {
    return [];
  }
}

function saveProfileToStorage(profile: UserProfile) {
  localStorage.setItem('user_profile', JSON.stringify({ version: 1, profile }));
}

function loadProfileFromStorage(): UserProfile | null {
  try {
    const stored = localStorage.getItem('user_profile');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && parsed.version === 1 && parsed.profile) {
      return parsed.profile;
    }
    return null;
  } catch {
    return null;
  }
}

function saveHintsToStorage(problemId: number, hints: { level: number; content: string }[]) {
  localStorage.setItem(`hints_${problemId}`, JSON.stringify(hints));
}

function loadHintsFromStorage(problemId: number): { level: number; content: string }[] {
  try {
    const stored = localStorage.getItem(`hints_${problemId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTreeProgressToStorage(records: SolvedRecord[]) {
  localStorage.setItem('tree_progress', JSON.stringify({ version: 1, records }));
}

function loadTreeProgressFromStorage(): SolvedRecord[] {
  try {
    const stored = localStorage.getItem('tree_progress');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (parsed && parsed.version === 1) return parsed.records || [];
    return [];
  } catch {
    return [];
  }
}

export const useStore = create<AppState>((set, get) => ({
  problems: [],
  setProblems: (problems) => set({ problems }),

  currentProblem: null,
  setCurrentProblem: (problem) => set({ currentProblem: problem }),

  code: '',
  setCode: (code) => set({ code }),

  output: '',
  setOutput: (output) => set({ output }),
  isRunning: false,
  setIsRunning: (running) => set({ isRunning: running }),

  testResults: [],
  setTestResults: (results) => set({ testResults: results }),

  chatMessages: [],
  chatProblemId: null,
  addChatMessage: (msg) =>
    set((state) => {
      const newMessages = [...state.chatMessages, msg];
      if (state.chatProblemId !== null) {
        saveChatToStorage(state.chatProblemId, newMessages);
      }
      return { chatMessages: newMessages };
    }),
  updateLastAssistantMessage: (content) =>
    set((state) => {
      const msgs = [...state.chatMessages];
      const lastIdx = msgs.length - 1;
      if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
        msgs[lastIdx] = { ...msgs[lastIdx], content };
      }
      return { chatMessages: msgs };
    }),
  clearChat: () => set({ chatMessages: [] }),
  loadChatForProblem: (problemId) => {
    const state = get();
    if (state.chatProblemId !== null && state.chatMessages.length > 0) {
      saveChatToStorage(state.chatProblemId, state.chatMessages);
    }
    set({
      chatProblemId: problemId,
      chatMessages: loadChatFromStorage(problemId),
    });
  },
  saveChatMessages: () => {
    const state = get();
    if (state.chatProblemId !== null) {
      saveChatToStorage(state.chatProblemId, state.chatMessages);
    }
  },
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setIsChatOpen: (open) => set({ isChatOpen: open }),
  isAILoading: false,
  setIsAILoading: (loading) => set({ isAILoading: loading }),

  pyodideReady: false,
  setPyodideReady: (ready) => set({ pyodideReady: ready }),

  difficultyFilter: '',
  categoryFilter: '',
  setDifficultyFilter: (f) => set({ difficultyFilter: f }),
  setCategoryFilter: (f) => set({ categoryFilter: f }),

  // Hints
  hints: [],
  hintProblemId: null,
  isHintLoading: false,
  showHintNudge: false,
  consecutiveFailures: 0,
  addHint: (level) =>
    set((state) => {
      const newHints = [...state.hints, { level, content: '' }];
      if (state.hintProblemId !== null) {
        saveHintsToStorage(state.hintProblemId, newHints);
      }
      return { hints: newHints };
    }),
  updateLastHint: (content) =>
    set((state) => {
      const newHints = [...state.hints];
      if (newHints.length > 0) {
        newHints[newHints.length - 1] = { ...newHints[newHints.length - 1], content };
      }
      if (state.hintProblemId !== null) {
        saveHintsToStorage(state.hintProblemId, newHints);
      }
      return { hints: newHints };
    }),
  setLastHintLevel: (level) =>
    set((state) => {
      const newHints = [...state.hints];
      if (newHints.length > 0) {
        newHints[newHints.length - 1] = { ...newHints[newHints.length - 1], level };
      }
      return { hints: newHints };
    }),
  loadHintsForProblem: (problemId) => {
    const state = get();
    if (state.hintProblemId !== null && state.hints.length > 0) {
      saveHintsToStorage(state.hintProblemId, state.hints);
    }
    const loaded = loadHintsFromStorage(problemId);
    set({
      hintProblemId: problemId,
      hints: loaded,
      showHintNudge: false,
      consecutiveFailures: 0,
    });
  },
  saveHints: () => {
    const state = get();
    if (state.hintProblemId !== null) {
      saveHintsToStorage(state.hintProblemId, state.hints);
    }
  },
  triggerHintNudge: () => {
    const state = get();
    const givenLevels = new Set(state.hints.map((h) => h.level));
    if (givenLevels.size >= 4 || state.isHintLoading) return;
    set({ showHintNudge: true });
  },
  dismissHintNudge: () => set({ showHintNudge: false }),
  incrementFailures: () =>
    set((state) => ({ consecutiveFailures: state.consecutiveFailures + 1 })),
  resetFailures: () => set({ consecutiveFailures: 0 }),
  setIsHintLoading: (loading) => set({ isHintLoading: loading }),
  hasAllLevels: () => {
    const state = get();
    const givenLevels = new Set(state.hints.map((h) => h.level));
    return givenLevels.size >= 4;
  },
  clearHints: () => {
    const state = get();
    if (state.hintProblemId !== null) {
      localStorage.removeItem(`hints_${state.hintProblemId}`);
    }
    set({ hints: [], showHintNudge: false, consecutiveFailures: 0 });
  },

  // User profile
  userProfile: null,
  loadProfile: () => {
    set({ userProfile: loadProfileFromStorage() });
  },
  saveProfile: (profile) => {
    saveProfileToStorage(profile);
    set({ userProfile: profile });
  },

  // Collections
  collections: [],
  collectionFilter: '',
  loadCollections: () => {
    set({ collections: loadCollectionsFromStorage() });
  },
  createCollection: (name) => {
    const newCollection: Collection = {
      id: Date.now().toString(36),
      name,
      problemIds: [],
      createdAt: Date.now(),
    };
    const updated = [...get().collections, newCollection];
    set({ collections: updated });
    saveCollectionsToStorage(updated);
    return newCollection;
  },
  deleteCollection: (id) => {
    const updated = get().collections.filter((c) => c.id !== id);
    set({ collections: updated, collectionFilter: get().collectionFilter === id ? '' : get().collectionFilter });
    saveCollectionsToStorage(updated);
  },
  renameCollection: (id, name) => {
    const updated = get().collections.map((c) => (c.id === id ? { ...c, name } : c));
    set({ collections: updated });
    saveCollectionsToStorage(updated);
  },
  addProblemToCollection: (collectionId, problemId) => {
    const updated = get().collections.map((c) =>
      c.id === collectionId && !c.problemIds.includes(problemId)
        ? { ...c, problemIds: [...c.problemIds, problemId] }
        : c
    );
    set({ collections: updated });
    saveCollectionsToStorage(updated);
  },
  removeProblemFromCollection: (collectionId, problemId) => {
    const updated = get().collections.map((c) =>
      c.id === collectionId ? { ...c, problemIds: c.problemIds.filter((pid) => pid !== problemId) } : c
    );
    set({ collections: updated });
    saveCollectionsToStorage(updated);
  },
  getCollectionsForProblem: (problemId) => {
    return get().collections.filter((c) => c.problemIds.includes(problemId));
  },
  setCollectionFilter: (id) => set({ collectionFilter: id }),

  // Error jump
  errorJumpTarget: null,
  setErrorJumpTarget: (target) => set({ errorJumpTarget: target }),
  dismissErrorJump: () => set({ errorJumpTarget: null }),

  // Teaching mode
  teachingSections: [],
  teachingDifficulty: 'Medium',
  currentSection: 0,
  isTeachingLoading: false,
  teachingProblemId: null,
  addTeachingSection: (title) =>
    set((state) => {
      const newSections = [...state.teachingSections, { title, content: '' }];
      return { teachingSections: newSections };
    }),
  updateLastSection: (content) =>
    set((state) => {
      const newSections = [...state.teachingSections];
      if (newSections.length > 0) {
        newSections[newSections.length - 1] = { ...newSections[newSections.length - 1], content };
      }
      return { teachingSections: newSections };
    }),
  updateSectionContent: (index, content) =>
    set((state) => {
      const newSections = [...state.teachingSections];
      if (index >= 0 && index < newSections.length) {
        newSections[index] = { ...newSections[index], content };
      }
      return { teachingSections: newSections };
    }),
  initTeachingSections: (titles, difficulty) =>
    set({
      teachingSections: titles.map((title) => ({ title, content: '' })),
      teachingDifficulty: difficulty || 'Medium',
      currentSection: 0,
    }),
  setCurrentSection: (section) => set({ currentSection: section }),
  clearTeaching: () => set({ teachingSections: [], teachingDifficulty: 'Medium', currentSection: 0, isTeachingLoading: false }),
  loadTeachingForProblem: (problemId) => {
    const { sections, difficulty } = loadTeachingFromStorage(problemId);
    set({
      teachingProblemId: problemId,
      teachingSections: sections,
      teachingDifficulty: difficulty,
      currentSection: 0,
      isTeachingLoading: false,
    });
  },
  saveTeaching: () => {
    const state = get();
    if (state.teachingProblemId !== null) {
      saveTeachingToStorage(state.teachingProblemId, state.teachingSections, state.teachingDifficulty);
    }
  },
  setIsTeachingLoading: (loading) => set({ isTeachingLoading: loading }),

  // Growth tree
  solvedRecords: [],
  treeJustGrew: false,
  loadTreeProgress: () => {
    set({ solvedRecords: loadTreeProgressFromStorage() });
  },
  markProblemSolved: (problemId, title, difficulty) => {
    const state = get();
    if (state.solvedRecords.some((r) => r.problemId === problemId)) return;
    const oldStage = getTreeStageInfo(state.solvedRecords.length).stage;
    const newRecords = [...state.solvedRecords, { problemId, title, difficulty, solvedAt: Date.now() }];
    const newStage = getTreeStageInfo(newRecords.length).stage;
    saveTreeProgressToStorage(newRecords);
    set({
      solvedRecords: newRecords,
      treeJustGrew: newStage !== oldStage,
    });
  },
  dismissTreeGrowth: () => set({ treeJustGrew: false }),
}));
