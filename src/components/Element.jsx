import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpLeft } from "lucide-react";
import { useRef, useState } from "react";

const GRID = 12;

const snap = (value) => Math.round(value / GRID) * GRID;

const morphEase = [0.33, 0, 0.2, 1];
const morphDuration = 0.35;

const colorTween = { type: "spring", stiffness: 320, damping: 28 };

function ShapeContent({ element }) {
  const st = element.style ?? {};
  const kind = st.shape ?? "rectangle";
  const isPoly = kind === "triangle" || kind === "diamond";
  const fill = st.fill ?? "#fde68a";
  const stroke = st.stroke ?? "transparent";
  const sw = st.strokeWidth ?? 0;
  const opacity = st.opacity ?? 1;
  const r = st.borderRadius ?? 16;
  const shadow = st.shadow !== false;

  const borderRadius = kind === "circle" ? "50%" : kind === "pill" ? "9999px" : `${r}px`;
  const boxShadow = shadow ? "0 12px 28px rgba(0,0,0,0.12)" : "none";

  const points = kind === "triangle" ? "50,6 94,94 6,94" : "50,6 94,50 50,94 6,50";

  return (
    <div className="relative h-full w-full">
      <motion.div
        key={`shape-${kind}`}
        className="absolute inset-0 flex items-stretch"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isPoly ? 0 : 1,
          scale: isPoly ? 0.92 : 1
        }}
        transition={{ duration: morphDuration * 0.72, ease: morphEase }}
        style={{ pointerEvents: "none" }}
      >
        <motion.div
          className="h-full w-full"
          style={{ borderStyle: "solid", boxSizing: "border-box" }}
          initial={false}
          animate={{
            backgroundColor: fill,
            borderColor: stroke,
            borderWidth: sw,
            opacity,
            boxShadow,
            borderRadius
          }}
          transition={{
            borderRadius: { duration: morphDuration, ease: morphEase },
            backgroundColor: colorTween,
            borderColor: colorTween,
            borderWidth: { duration: 0.25 },
            opacity: { duration: 0.28 },
            boxShadow: { duration: 0.35 }
          }}
        />
      </motion.div>

      <motion.div
        key={`poly-${kind}`}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isPoly ? 1 : 0,
          scale: isPoly ? 1 : 0.92
        }}
        transition={{ duration: morphDuration * 0.72, ease: morphEase }}
        style={{ pointerEvents: "none" }}
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ filter: shadow ? "drop-shadow(0 10px 18px rgba(0,0,0,0.14))" : undefined }}
        >
          {(kind === "triangle" || kind === "diamond") && (
            <motion.polygon
              points={points}
              vectorEffect="nonScalingStroke"
              strokeLinejoin="round"
              initial={{ opacity: 0.85 }}
              animate={{
                opacity,
                fill,
                stroke,
                strokeWidth: sw,
                points
              }}
              transition={{
                opacity: { duration: morphDuration * 0.5, ease: morphEase },
                points: { duration: morphDuration, ease: morphEase },
                fill: colorTween,
                stroke: colorTween,
                strokeWidth: { duration: 0.25 }
              }}
            />
          )}
        </svg>
      </motion.div>
    </div>
  );
}

export default function Element({
  element,
  selected,
  onSelect,
  onMove,
  onResize,
  onTextChange,
  onDragStart,
  onDragEnd
}) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStartRef = useRef(null);

  const interacting = dragging || resizing;
  const layoutTransition = {
    x: { type: "spring", stiffness: interacting ? 700 : 400, damping: interacting ? 35 : 25, mass: 0.5 },
    y: { type: "spring", stiffness: interacting ? 700 : 400, damping: interacting ? 35 : 25, mass: 0.5 },
    width: { type: "spring", stiffness: interacting ? 500 : 300, damping: interacting ? 30 : 20, mass: 0.5 },
    height: { type: "spring", stiffness: interacting ? 500 : 300, damping: interacting ? 30 : 20, mass: 0.5 }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest("[data-resize-handle]")) return;
    onSelect(element.id);
    setDragging(true);
    onDragStart?.();
    const start = { x: e.clientX, y: e.clientY, ox: element.x, oy: element.y };
    dragStartRef.current = start;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      onMove(element.id, { x: snap(start.ox + dx), y: snap(start.oy + dy) });
    };

    const onMouseUp = () => {
      setDragging(false);
      onDragEnd?.();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startResize = (event, handle) => {
    event.stopPropagation();
    onSelect(element.id);
    setResizing(true);
    const start = {
      x: event.clientX,
      y: event.clientY,
      ox: element.x,
      oy: element.y,
      ow: element.width,
      oh: element.height
    };

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      let next = { x: start.ox, y: start.oy, width: start.ow, height: start.oh };

      if (handle.includes("e")) next.width = Math.max(100, snap(start.ow + dx));
      if (handle.includes("s")) next.height = Math.max(60, snap(start.oh + dy));
      if (handle.includes("w")) {
        next.width = Math.max(100, snap(start.ow - dx));
        next.x = snap(start.ox + dx);
      }
      if (handle.includes("n")) {
        next.height = Math.max(60, snap(start.oh - dy));
        next.y = snap(start.oy + dy);
      }

      onResize(element.id, next);
    };

    const onMouseUpResize = () => {
      setResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUpResize);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUpResize);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      }}
      transition={layoutTransition}
      className={`absolute ${
        selected ? "shadow-soft" : ""
      } ${element.type === "shape" ? "bg-transparent" : "bg-white"}`}
      style={{ 
        cursor: dragging ? "grabbing" : "grab",
        borderRadius: element.type === "shape" ? (element.style?.shape === "circle" ? "50%" : element.style?.shape === "pill" ? "9999px" : `${element.style?.borderRadius ?? 16}px`) : "16px",
        border: selected ? "2px solid black" : "2px solid transparent"
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: element.type === "shape" ? (element.style?.shape === "circle" ? "50%" : element.style?.shape === "pill" ? "9999px" : `${element.style?.borderRadius ?? 16}px`) : "16px" }}>
        {element.type === "text" ? (
          <div
            contentEditable
            suppressContentEditableWarning
            onDoubleClick={(e) => e.stopPropagation()}
            onBlur={(e) => onTextChange(element.id, e.currentTarget.innerText)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.currentTarget.blur();
              }
            }}
            className="h-full w-full overflow-auto p-4 outline-none"
            style={{
              fontSize: `${element.style?.fontSize ?? 16}px`,
              fontWeight: element.style?.bold ? 700 : 400,
              fontStyle: element.style?.italic ? "italic" : "normal",
              color: element.style?.color ?? "#171717",
              background: element.style?.background ?? "transparent",
              borderRadius: "inherit"
            }}
          >
            {element.content}
          </div>
        ) : element.type === "shape" ? (
          <ShapeContent element={element} />
        ) : (
          <img
            src={element.src}
            alt="Scrapbook"
            draggable={false}
            className="h-full w-full object-cover shadow-soft"
            style={{
              borderRadius: `${element.style?.borderRadius ?? 16}px`,
              borderWidth: `${element.style?.borderWidth ?? 0}px`,
              borderColor: element.style?.borderColor ?? "#292524",
              borderStyle: (element.style?.borderWidth ?? 0) > 0 ? "solid" : "none",
              boxSizing: "border-box"
            }}
          />
        )}
      </div>

      {selected && (
        <>
          <button
            type="button"
            data-resize-handle
            title="Resize"
            onMouseDown={(e) => startResize(e, "se")}
            className="absolute -bottom-2 -right-2 z-30 flex h-7 w-7 cursor-se-resize items-center justify-center rounded-xl border-2 border-black bg-white text-black shadow-md hover:bg-neutral-50"
          >
            <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            data-resize-handle
            title="Resize"
            onMouseDown={(e) => startResize(e, "nw")}
            className="absolute -left-2 -top-2 z-30 flex h-7 w-7 cursor-nw-resize items-center justify-center rounded-xl border-2 border-black bg-white text-black shadow-md hover:bg-neutral-50"
          >
            <ArrowUpLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </>
      )}
    </motion.div>
  );
}
