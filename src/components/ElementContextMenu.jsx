import { motion, AnimatePresence } from "framer-motion";
import { Copy, Trash2, SquareSplitHorizontal } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ElementContextMenu({ element, position, onClose, onDelete, onDuplicate, onBringToFront, onSendToBack }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const menuStyle = {
    left: Math.min(position.x, window.innerWidth - 200),
    top: Math.min(position.y, window.innerHeight - 200)
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-50 min-w-[180px] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-2xl"
        style={menuStyle}
      >
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-neutral-400">
            {element?.type === "text" ? "Text Element" : element?.type === "image" ? "Image" : "Shape"}
          </span>
        </div>
        <div className="h-px bg-neutral-100" />
        <button
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-neutral-50"
          onClick={() => {
            onDuplicate?.(element.id);
            onClose();
          }}
        >
          <Copy className="h-4 w-4 text-neutral-500" />
          Duplicate
        </button>
        <button
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-neutral-50"
          onClick={() => {
            onBringToFront?.(element.id);
            onClose();
          }}
        >
          <SquareSplitHorizontal className="h-4 w-4 text-neutral-500 rotate-0" />
          Bring to front
        </button>
        <button
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-neutral-50"
          onClick={() => {
            onSendToBack?.(element.id);
            onClose();
          }}
        >
          <SquareSplitHorizontal className="h-4 w-4 text-neutral-500 rotate-180" />
          Send to back
        </button>
        <div className="h-px bg-neutral-100" />
        <button
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          onClick={() => {
            onDelete?.(element.id);
            onClose();
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
