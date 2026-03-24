import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import Element from "./Element";
import ElementInspector from "./ElementInspector";
import ElementContextMenu from "./ElementContextMenu";

const patternStyles = {
  grid: {
    backgroundImage: `
      linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
    `,
    backgroundSize: "24px 24px"
  },
  dots: {
    backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)`,
    backgroundSize: "24px 24px"
  },
  none: {
    backgroundImage: "none"
  }
};

export default function Canvas({
  page,
  selectedElement,
  onSelect,
  onMove,
  onResize,
  onTextChange,
  onPatchStyle,
  onSetShape,
  canvasBackground,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack
}) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [zoom, setZoom] = useState(1);

  const bg = canvasBackground ?? { color: "#ffffff", pattern: "grid" };
  const patternStyle = patternStyles[bg.pattern] ?? patternStyles.grid;

  const handlePanMouseDown = (e) => {
    if (e.target.closest("[data-element]")) return;
    setPanning(true);
    const start = { x: e.clientX, y: e.clientY, ox: pan.x, oy: pan.y };

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      setPan({ x: start.ox + dx, y: start.oy + dy });
    };

    const onMouseUp = () => {
      setPanning(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleCanvasContextMenu = (e) => {
    e.preventDefault();
    const element = e.target.closest("[data-element]");
    if (element) {
      const elementId = element.dataset.elementId;
      const el = page?.elements?.find((el) => el.id === elementId);
      if (el) {
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          element: el
        });
      }
    } else {
      setContextMenu(null);
    }
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.1, 0.5));
  };
  
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle escape key to deselect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onSelect(null);
        setContextMenu(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelect]);

  return (
    <div className="relative h-full overflow-hidden" style={{ backgroundColor: bg.color }} onMouseDown={handlePanMouseDown} onContextMenu={handleCanvasContextMenu}>
      <motion.div
        animate={{ x: pan.x, y: pan.y, scale: zoom }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
        className={`relative h-[2200px] w-[3200px] ${panning ? "cursor-grabbing" : "cursor-default"}`}
        style={{ ...patternStyle, transformOrigin: '50% 50%' }}
      >
        {(page?.elements ?? []).map((element) => (
          <div key={element.id} data-element data-element-id={element.id} className="absolute left-0 top-0">
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

      <ElementInspector element={selectedElement} onPatchStyle={onPatchStyle} onSetShape={onSetShape} onClose={() => onSelect(null)} />
      
      {contextMenu && (
        <ElementContextMenu
          element={contextMenu.element}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onDelete={onDeleteElement}
          onDuplicate={onDuplicateElement}
          onBringToFront={onBringToFront}
          onSendToBack={onSendToBack}
        />
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomOut}
          className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100"
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100"
          title="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomIn}
          className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100"
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
