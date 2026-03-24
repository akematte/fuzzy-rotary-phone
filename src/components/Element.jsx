import { motion } from "framer-motion";
import { useRef, useState } from "react";

const GRID = 12;

const snap = (value) => Math.round(value / GRID) * GRID;

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
  const dragStartRef = useRef(null);

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

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        scale: dragging ? 1.02 : 1
      }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className={`absolute rounded-2xl border ${
        selected ? "border-black shadow-soft" : "border-transparent"
      } bg-white`}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
    >
      {element.type === "text" ? (
        <div
          contentEditable
          suppressContentEditableWarning
          onDoubleClick={(e) => e.stopPropagation()}
          onBlur={(e) => onTextChange(element.id, e.currentTarget.innerText)}
          className="h-full w-full overflow-auto rounded-2xl p-4 outline-none"
          style={{
            fontSize: `${element.style?.fontSize ?? 16}px`,
            fontWeight: element.style?.bold ? 700 : 400,
            fontStyle: element.style?.italic ? "italic" : "normal"
          }}
        >
          {element.content}
        </div>
      ) : (
        <img
          src={element.src}
          alt="Scrapbook"
          draggable={false}
          className="h-full w-full rounded-2xl object-cover shadow-soft"
        />
      )}

      {selected && (
        <>
          <button
            data-resize-handle
            onMouseDown={(e) => startResize(e, "se")}
            className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border border-black bg-white"
          />
          <button
            data-resize-handle
            onMouseDown={(e) => startResize(e, "nw")}
            className="absolute -left-2 -top-2 h-4 w-4 rounded-full border border-black bg-white"
          />
        </>
      )}
    </motion.div>
  );
}
