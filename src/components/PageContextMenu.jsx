import { motion, AnimatePresence } from "framer-motion";
import { Trash2, FilePenLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function PageContextMenu({ page, position, onClose, onDelete, onRename }) {
  const menuRef = useRef(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(page?.name ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (isRenaming && newName.trim()) {
          onRename?.(page.id, newName.trim());
        }
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (isRenaming && newName.trim()) {
          onRename?.(page.id, newName.trim());
        }
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, onRename, page.id, newName, isRenaming]);

  const menuStyle = {
    left: Math.min(position.x, window.innerWidth - 200),
    top: Math.min(position.y, window.innerHeight - 150)
  };

  const handleSubmitRename = () => {
    if (newName.trim()) {
      onRename?.(page.id, newName.trim());
    }
    setIsRenaming(false);
    onClose();
  };

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
        {isRenaming ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className="p-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitRename();
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all duration-150"
              placeholder="Page name"
            />
          </motion.div>
        ) : (
          <>
            <div className="mb-1 flex items-center gap-2 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-neutral-300" />
              <span className="text-xs font-semibold text-neutral-500">Page options</span>
            </div>
            <div className="h-px bg-neutral-100" />
            <button
              className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-all duration-150 hover:bg-neutral-100"
              onClick={() => setIsRenaming(true)}
            >
              <FilePenLine className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-neutral-600" />
              Rename
            </button>
            <div className="my-1 h-px bg-neutral-100" />
            <button
              className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-100"
              onClick={() => {
                onDelete?.(page.id);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4 transition-colors group-hover:text-red-700" />
              Delete
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
