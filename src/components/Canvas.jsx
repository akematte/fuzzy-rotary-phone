import { motion } from "framer-motion";
import { useState } from "react";
import Element from "./Element";
import ElementInspector from "./ElementInspector";

export default function Canvas({
  page,
  selectedElement,
  onSelect,
  onMove,
  onResize,
  onTextChange,
  onPatchStyle,
  onSetShape
}) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

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
        transition={{
          type: "spring",
          stiffness: panning ? 620 : 280,
          damping: panning ? 40 : 32,
          mass: panning ? 0.32 : 0.55,
          restDelta: 0.15,
          restSpeed: 0.15
        }}
        className={`canvas-grid relative h-[2200px] w-[3200px] ${panning ? "cursor-grabbing" : "cursor-default"}`}
      >
        {(page?.elements ?? []).map((element) => (
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

      <ElementInspector element={selectedElement} onPatchStyle={onPatchStyle} onSetShape={onSetShape} />
    </div>
  );
}
