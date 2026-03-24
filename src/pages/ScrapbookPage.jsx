import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef } from "react";
import Canvas from "../components/Canvas";
import Sidebar from "../components/Sidebar";
import Toolbar from "../components/Toolbar";
import { useScrapbookStore } from "../store/useScrapbookStore";

export default function ScrapbookPage() {
  const imageInputRef = useRef(null);

  const {
    pages,
    activePageId,
    selectedElementId,
    sidebarCollapsed,
    history,
    future,
    createPage,
    setActivePage,
    setSelectedElementId,
    toggleSidebar,
    addTextElement,
    addImageElement,
    updateElement,
    updateTextStyle,
    undo,
    redo
  } = useScrapbookStore();

  const activePage = useMemo(() => pages.find((p) => p.id === activePageId) ?? null, [pages, activePageId]);
  const selectedElement = useMemo(
    () => activePage?.elements?.find((el) => el.id === selectedElementId) ?? null,
    [activePage, selectedElementId]
  );

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

  if (!pages.length) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
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

  return (
    <div className="flex h-full bg-white">
      <Sidebar
        pages={pages}
        activePageId={activePageId}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onNewPage={createPage}
        onSelectPage={setActivePage}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <Toolbar
          onAddText={addTextElement}
          onAddImage={() => imageInputRef.current?.click()}
          onUndo={undo}
          onRedo={redo}
          canUndo={history.length > 0}
          canRedo={future.length > 0}
        />

        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activePage?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full"
          >
            <Canvas
              page={activePage}
              selectedElement={selectedElement}
              onSelect={setSelectedElementId}
              onMove={(id, patch) => updateElement(id, patch)}
              onResize={(id, patch) => updateElement(id, patch)}
              onTextChange={(id, content) => updateElement(id, { content })}
              onTextStyle={updateTextStyle}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
