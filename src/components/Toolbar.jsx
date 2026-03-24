import { motion } from "framer-motion";
import { Download, ImagePlus, Link2, Redo2, Share2, Shapes, Type, Undo2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function ActionButton({ icon: Icon, label, onClick, disabled = false }) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}

export default function Toolbar({
  className = "",
  onAddText,
  onAddShape,
  onAddImage,
  onUndo,
  onRedo,
  onCopyShareLink,
  onExportJson,
  onImportJsonPick,
  canUndo,
  canRedo
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div
      ref={wrapRef}
      className={`relative flex h-full min-h-0 flex-wrap items-center justify-between gap-2 bg-white px-3 py-2 sm:px-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton icon={Type} label="Add Text" onClick={onAddText} />
        <ActionButton icon={Shapes} label="Add Shape" onClick={onAddShape} />
        <ActionButton icon={ImagePlus} label="Add Image" onClick={onAddImage} />
        <div className="relative">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition hover:bg-neutral-50"
          >
            <Share2 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Share</span>
          </motion.button>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border border-neutral-200 bg-white py-1 shadow-soft"
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50"
                onClick={() => {
                  setMenuOpen(false);
                  onCopyShareLink?.();
                }}
              >
                <Link2 className="h-4 w-4" />
                Copy share link
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50"
                onClick={() => {
                  setMenuOpen(false);
                  onExportJson?.();
                }}
              >
                <Download className="h-4 w-4" />
                Download JSON
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50"
                onClick={() => {
                  setMenuOpen(false);
                  onImportJsonPick?.();
                }}
              >
                <Upload className="h-4 w-4" />
                Import JSON…
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ActionButton icon={Undo2} label="Undo" onClick={onUndo} disabled={!canUndo} />
        <ActionButton icon={Redo2} label="Redo" onClick={onRedo} disabled={!canRedo} />
      </div>
    </div>
  );
}
