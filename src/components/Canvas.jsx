import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Element from "./Element";

export default function Canvas({
  page,
  selectedElement,
  onSelect,
  onMove,
  onResize,
  onTextChange,
  onTextStyle
}) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

  const selectedTextElement = useMemo(
    () => (selectedElement?.type === "text" ? selectedElement : null),
    [selectedElement]
  );

  const handlePanMouseDown = (e) => {
    if (e.target.closest("[data-element]")) return;
    setPanning(true);
    const start = { x: e.clientX, y: e.clientY, ox: pan.x, oy: pan.y };

    const onMouseMove = (moveEvent) => {
      setPan({ x: start.ox + (moveEvent.clientX - start.x), y: start.oy + (moveEvent.clientY - start.y) });
    };

    const onMouseUp = () => {
      setPanning(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="relative h-full overflow-hidden bg-white" onMouseDown={handlePanMouseDown}>
      <motion.div
        animate={{ x: pan.x, y: pan.y }}
        transition={{ type: "spring", stiffness: 220, damping: 30 }}
        className={`canvas-grid relative h-[2200px] w-[3200px] ${panning ? "cursor-grabbing" : "cursor-default"}`}
      >
        {page.elements.map((element) => (
          <div key={element.id} data-element className="absolute left-0 top-0">
            <Element
              element={element}
              selected={selectedElement?.id === element.id}
              onSelect={onSelect}
              onMove={onMove}
              onResize={onResize}
              onTextChange={onTextChange}
            />
          </div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedTextElement && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-neutral-200 bg-white/85 p-2 shadow-soft backdrop-blur"
          >
            <button
              onClick={() =>
                onTextStyle(selectedTextElement.id, { fontSize: Math.max(12, (selectedTextElement.style?.fontSize ?? 16) - 2) })
              }
              className="rounded-xl border border-neutral-200 p-2 hover:bg-neutral-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-12 text-center text-sm">{selectedTextElement.style?.fontSize ?? 16}px</span>
            <button
              onClick={() => onTextStyle(selectedTextElement.id, { fontSize: (selectedTextElement.style?.fontSize ?? 16) + 2 })}
              className="rounded-xl border border-neutral-200 p-2 hover:bg-neutral-100"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => onTextStyle(selectedTextElement.id, { bold: !selectedTextElement.style?.bold })}
              className={`rounded-xl border px-3 py-2 text-sm hover:bg-neutral-100 ${selectedTextElement.style?.bold ? "border-black" : "border-neutral-200"}`}
            >
              B
            </button>
            <button
              onClick={() => onTextStyle(selectedTextElement.id, { italic: !selectedTextElement.style?.italic })}
              className={`rounded-xl border px-3 py-2 text-sm italic hover:bg-neutral-100 ${
                selectedTextElement.style?.italic ? "border-black" : "border-neutral-200"
              }`}
            >
              I
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
