import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import Canvas from "../components/Canvas";
import Sidebar from "../components/Sidebar";
import SidebarLayout from "../components/SidebarLayout";
import Toolbar from "../components/Toolbar";
import { decodeBoardPayload, encodeBoardPayload, isPayloadTooLongForUrl } from "../lib/shareBoard";
import { useScrapbookStore } from "../store/useScrapbookStore";

export default function ScrapbookPage() {
  const imageInputRef = useRef(null);
  const importBoardInputRef = useRef(null);

  const {
    pages,
    activePageId,
    selectedElementId,
    sidebarCollapsed,
    canvasBackground,
    history,
    future,
    createPage,
    setActivePage,
    setSelectedElementId,
    toggleSidebar,
    addTextElement,
    addShapeElement,
    addImageElement,
    updateElement,
    patchElementStyle,
    patchShapeWithFit,
    importBoard,
    setCanvasBackground,
    deleteElement,
    duplicateElement,
    bringElementToFront,
    sendElementToBack,
    undo,
    redo
  } = useScrapbookStore();

  const activePage = useMemo(() => pages.find((p) => p.id === activePageId) ?? null, [pages, activePageId]);
  const selectedElement = useMemo(
    () => activePage?.elements?.find((el) => el.id === selectedElementId) ?? null,
    [activePage, selectedElementId]
  );

  const sidebarWidth = sidebarCollapsed ? 74 : 280;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("share");
    if (!raw) return;
    try {
      const data = decodeBoardPayload(raw);
      if (data.v !== 1 || !Array.isArray(data.pages) || data.pages.length === 0) return;
      const ok = window.confirm("Open shared board? This replaces your current scrapbook.");
      if (ok) {
        importBoard(data);
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch {
      /* invalid share payload */
    }
  }, [importBoard]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    addImageElement(url);
    event.target.value = "";
  };

  const handleCopyShareLink = () => {
    const enc = encodeBoardPayload(pages, activePageId);
    const base = `${window.location.origin}${window.location.pathname}`;
    if (isPayloadTooLongForUrl(enc)) {
      void navigator.clipboard.writeText(JSON.stringify({ v: 1, pages, activePageId }, null, 2));
      window.alert("This board is too large for a link. Full JSON was copied to your clipboard instead.");
      return;
    }
    const url = `${base}?share=${encodeURIComponent(enc)}`;
    void navigator.clipboard.writeText(url);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify({ v: 1, pages, activePageId }, null, 2)], {
      type: "application/json"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "scrapbook-board.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImportJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.v !== 1 || !Array.isArray(data.pages) || data.pages.length === 0) throw new Error("invalid");
      const ok = window.confirm("Import this board? Your current scrapbook will be replaced.");
      if (ok) importBoard(data);
    } catch {
      window.alert("Could not import that file.");
    }
    event.target.value = "";
  };

  if (!pages.length) {
    return (
      <div className="flex h-full items-center justify-center bg-[#e8e8ea]">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">Start creating your scrapbook</h2>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={createPage}
            className="rounded-2xl border border-black bg-black px-6 py-3 text-sm font-medium text-white shadow-soft"
          >
            Create your first page
          </motion.button>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between px-3">
        {!sidebarCollapsed && (
          <h1 className="truncate text-sm font-semibold tracking-tight text-neutral-900">Scrapbook</h1>
        )}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={toggleSidebar}
          className="rounded-lg border border-neutral-200 bg-white p-1.5 transition hover:bg-neutral-50"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={`h-3.5 w-3.5 transition ${sidebarCollapsed ? "rotate-180" : ""}`} />
        </motion.button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <Sidebar
          pages={pages}
          activePageId={activePageId}
          collapsed={sidebarCollapsed}
          onNewPage={createPage}
          onSelectPage={setActivePage}
        />
      </div>
    </>
  );

  const topbarContent = (
    <Toolbar
      className="min-h-0 min-w-0 flex-1 border-0 bg-transparent py-0 shadow-none"
      onAddText={addTextElement}
      onAddShape={addShapeElement}
      onAddImage={() => imageInputRef.current?.click()}
      onUndo={undo}
      onRedo={redo}
      onCopyShareLink={handleCopyShareLink}
      onExportJson={handleExportJson}
      onImportJsonPick={() => importBoardInputRef.current?.click()}
      onSetCanvasBackground={setCanvasBackground}
      canvasBackground={canvasBackground}
      canUndo={history.length > 0}
      canRedo={future.length > 0}
    />
  );

  return (
    <SidebarLayout sidebar={sidebarContent} sidebarWidth={sidebarWidth} sidebarCollapsed={sidebarCollapsed} topbar={topbarContent}>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input
        ref={importBoardInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportJson}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activePage?.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="h-full min-h-0"
        >
          <Canvas
            page={activePage}
            selectedElement={selectedElement}
            onSelect={setSelectedElementId}
            onMove={(id, patch) => updateElement(id, patch)}
            onResize={(id, patch) => updateElement(id, patch)}
            onTextChange={(id, content) => updateElement(id, { content })}
            onPatchStyle={patchElementStyle}
            onSetShape={patchShapeWithFit}
            canvasBackground={canvasBackground}
            onDeleteElement={deleteElement}
            onDuplicateElement={duplicateElement}
            onBringToFront={bringElementToFront}
            onSendToBack={sendElementToBack}
          />
        </motion.div>
      </AnimatePresence>
    </SidebarLayout>
  );
}
