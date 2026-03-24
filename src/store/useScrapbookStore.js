import { create } from "zustand";
import { fitShapeBox } from "../lib/shapeFit";

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
  style: { fontSize: 20, bold: false, italic: false, color: "#171717", background: "transparent" }
});

const createImageElement = (src) => ({
  id: uid(),
  type: "image",
  x: 240,
  y: 180,
  width: 280,
  height: 220,
  src,
  style: { borderRadius: 16, borderWidth: 0, borderColor: "#292524" }
});

const createShapeElement = () => ({
  id: uid(),
  type: "shape",
  x: 220,
  y: 160,
  width: 200,
  height: 200,
  style: {
    shape: "rectangle",
    fill: "#fde68a",
    stroke: "#292524",
    strokeWidth: 2,
    borderRadius: 24,
    opacity: 1,
    shadow: true
  }
});

const saveState = (state) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      pages: state.pages,
      activePageId: state.activePageId,
      canvasBackground: state.canvasBackground
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
    canvasBackground: restored?.canvasBackground ?? { color: "#ffffff", pattern: "grid" },

    commit: (updater) => {
      set((state) => {
        const snapshot = {
          pages: state.pages,
          activePageId: state.activePageId,
          canvasBackground: state.canvasBackground
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

    setCanvasBackground: (background) =>
      get().commit(() => ({ canvasBackground: background })),

    deleteElement: (elementId) =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => ({
          ...p,
          elements: p.elements.filter((el) => el.id !== elementId)
        })),
        selectedElementId: null
      })),

    duplicateElement: (elementId) =>
      get().commit((state) => {
        const page = state.pages.find((p) => p.id === state.activePageId);
        const element = page?.elements.find((el) => el.id === elementId);
        if (!element) return { pages: state.pages };
        
        const newElement = {
          ...JSON.parse(JSON.stringify(element)),
          id: uid(),
          x: element.x + 20,
          y: element.y + 20
        };
        
        return {
          pages: updatePageById(state.pages, state.activePageId, (p) => ({
            ...p,
            elements: [...p.elements, newElement]
          }))
        };
      }),

    bringElementToFront: (elementId) =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => {
          const elements = p.elements.filter((el) => el.id !== elementId);
          const element = p.elements.find((el) => el.id === elementId);
          return { ...p, elements: [...elements, element] };
        })
      })),

    sendElementToBack: (elementId) =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => {
          const elements = p.elements.filter((el) => el.id !== elementId);
          const element = p.elements.find((el) => el.id === elementId);
          return { ...p, elements: [element, ...elements] };
        })
      })),

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

    addShapeElement: () =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => ({
          ...p,
          elements: [...p.elements, createShapeElement()]
        }))
      })),

    updateElement: (elementId, patch) =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => ({
          ...p,
          elements: p.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el))
        }))
      })),

    patchElementStyle: (elementId, stylePatch) =>
      get().commit((state) => ({
        pages: updatePageById(state.pages, state.activePageId, (p) => ({
          ...p,
          elements: p.elements.map((el) =>
            el.id === elementId
              ? { ...el, style: { ...(el.style ?? {}), ...stylePatch } }
              : el
          )
        }))
      })),

    patchShapeWithFit: (elementId, shape) => {
      const state = get();
      const pageId = state.activePageId;
      const page = state.pages.find((p) => p.id === pageId);
      const el = page?.elements.find((e) => e.id === elementId);
      if (!el || el.type !== "shape") return;
      get().commit((s) => ({
        pages: updatePageById(s.pages, pageId, (p) => ({
          ...p,
          elements: p.elements.map((e) => {
            if (e.id !== elementId) return e;
            const b = fitShapeBox(e, shape);
            return { ...e, ...b, style: { ...(e.style ?? {}), shape } };
          })
        }))
      }));
    },

    importBoard: (payload) => {
      if (!payload?.pages || !Array.isArray(payload.pages) || payload.pages.length === 0) return false;
      get().commit(() => ({
        pages: payload.pages,
        activePageId: payload.activePageId ?? payload.pages[0]?.id ?? null,
        selectedElementId: null
      }));
      return true;
    },

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
