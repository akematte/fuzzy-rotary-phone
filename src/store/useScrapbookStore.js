import { create } from "zustand";

const STORAGE_KEY = "scrapbook-data-v1";

const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createPage = (name = "Untitled Page") => ({
  id: uid(),
  name,
  elements: []
});

const createTextElement = () => ({
  id: uid(),
  type: "text",
  x: 200,
  y: 140,
  width: 260,
  height: 120,
  content: "Double click to edit",
  style: { fontSize: 20, bold: false, italic: false }
});

const createImageElement = (src) => ({
  id: uid(),
  type: "image",
  x: 240,
  y: 180,
  width: 280,
  height: 220,
  src
});

const saveState = (state) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      pages: state.pages,
      activePageId: state.activePageId
    })
  );
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.pages)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const updatePageById = (pages, pageId, updater) =>
  pages.map((p) => (p.id === pageId ? updater(p) : p));

export const useScrapbookStore = create((set, get) => {
  const restored = typeof window !== "undefined" ? loadState() : null;
  const initialPages = restored?.pages ?? [];
  const initialActivePageId = restored?.activePageId ?? initialPages[0]?.id ?? null;

  return {
    pages: initialPages,
    activePageId: initialActivePageId,
    selectedElementId: null,
    sidebarCollapsed: false,
    history: [],
    future: [],

    commit: (updater) => {
      set((state) => {
        const snapshot = {
          pages: state.pages,
          activePageId: state.activePageId
        };
        const nextPartial = updater(state);
        const next = { ...state, ...nextPartial, history: [...state.history, snapshot], future: [] };
        saveState(next);
        return next;
      });
    },

    createPage: () =>
      get().commit((state) => {
        const page = createPage(`Page ${state.pages.length + 1}`);
        return {
          pages: [...state.pages, page],
          activePageId: page.id,
          selectedElementId: null
        };
      }),

    setActivePage: (pageId) => set({ activePageId: pageId, selectedElementId: null }),
    setSelectedElementId: (id) => set({ selectedElementId: id }),
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    renamePage: (pageId, name) =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, pageId, (p) => ({ ...p, name }))
      })),

    addTextElement: () =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => ({
          ...p,
          elements: [...p.elements, createTextElement()]
        }))
      })),

    addImageElement: (src) =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => ({
          ...p,
          elements: [...p.elements, createImageElement(src)]
        }))
      })),

    updateElement: (elementId, patch) =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => ({
          ...p,
          elements: p.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el))
        }))
      })),

    updateTextStyle: (elementId, stylePatch) =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => ({
          ...p,
          elements: p.elements.map((el) =>
            el.id === elementId ? { ...el, style: { ...el.style, ...stylePatch } } : el
          )
        }))
      })),

    undo: () => {
      const state = get();
      if (!state.history.length) return;
      const previous = state.history[state.history.length - 1];
      set({
        pages: previous.pages,
        activePageId: previous.activePageId,
        history: state.history.slice(0, -1),
        future: [{ pages: state.pages, activePageId: state.activePageId }, ...state.future],
        selectedElementId: null
      });
      saveState(get());
    },

    redo: () => {
      const state = get();
      if (!state.future.length) return;
      const [next, ...rest] = state.future;
      set({
        pages: next.pages,
        activePageId: next.activePageId,
        history: [...state.history, { pages: state.pages, activePageId: state.activePageId }],
        future: rest,
        selectedElementId: null
      });
      saveState(get());
    }
  };
});
