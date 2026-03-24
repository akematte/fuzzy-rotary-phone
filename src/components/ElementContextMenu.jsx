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

  const menuItemClass = "group flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium transition-all duration-150";

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.96, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="fixed z-50 min-w-[200px] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-2xl"
        style={menuStyle}
      >
        <div className="mb-1 px-3 py-2">
          <span className="text-xs font-semibold capitalize text-neutral-400">
            {element?.type ?? "Element"}
          </span>
        </div>
        <div className="h-px bg-neutral-100" />
        <button
          className={`${menuItemClass} text-neutral-700 hover:bg-neutral-50`}
          onClick={() => {
            onDuplicate?.(element.id);
            onClose();
          }}
        >
          <Copy className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-neutral-600" />
          Duplicate
        </button>
        <button
          className={`${menuItemClass} text-neutral-700 hover:bg-neutral-50`}
          onClick={() => {
            onBringToFront?.(element.id);
            onClose();
          }}
        >
          <SquareSplitHorizontal className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-neutral-600 rotate-0" />
          Bring to front
        </button>
        <button
          className={`${menuItemClass} text-neutral-700 hover:bg-neutral-50`}
          onClick={() => {
            onSendToBack?.(element.id);
            onClose();
          }}
        >
          <SquareSplitHorizontal className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-neutral-600 rotate-180" />
          Send to back
        </button>
        <div className="my-1 h-px bg-neutral-100" />
        <button
          className={`${menuItemClass} text-red-600 hover:bg-red-50`}
          onClick={() => {
            onDelete?.(element.id);
            onClose();
          }}
        >
          <Trash2 className="h-4 w-4 transition-colors group-hover:text-red-700" />
          Delete
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
