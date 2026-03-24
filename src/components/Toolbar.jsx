import { motion, AnimatePresence } from "framer-motion";
import { Download, ImagePlus, Link2, Palette, Redo2, Share2, Shapes, Type, Undo2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function ActionButton({ icon: Icon, label, onClick, disabled = false }) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}

const colors = [
  { value: "#ffffff", label: "White" },
  { value: "#171717", label: "Black" },
  { value: "#fef3c7", label: "Amber" },
  { value: "#dbeafe", label: "Blue" },
  { value: "#d1fae5", label: "Green" },
  { value: "#fce7f3", label: "Pink" },
  { value: "#f3f4f6", label: "Gray" },
  { value: "#fee2e2", label: "Red" },
  { value: "#e0e7ff", label: "Indigo" },
  { value: "#ffedd5", label: "Orange" }
];

const patterns = [
  { id: "grid", label: "Grid" },
  { id: "dots", label: "Dots" },
  { id: "none", label: "None" }
];

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
  onSetCanvasBackground,
  canvasBackground,
  canUndo,
  canRedo
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bgMenuOpen, setBgMenuOpen] = useState(false);
  const wrapRef = useRef(null);
  const bgWrapRef = useRef(null);

  useEffect(() => {
    if (!menuOpen && !bgMenuOpen) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false);
      if (bgWrapRef.current && !bgWrapRef.current.contains(e.target)) setBgMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen, bgMenuOpen]);

  return (
    <div
      ref={wrapRef}
      className={`relative flex h-full min-h-0 flex-wrap items-center justify-between gap-2 bg-white px-3 py-2 sm:px-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton icon={Type} label="Add Text" onClick={onAddText} />
        <ActionButton icon={Shapes} label="Add Shape" onClick={onAddShape} />
        <ActionButton icon={ImagePlus} label="Add Image" onClick={onAddImage} />
        
        {/* Background menu */}
        <div className="relative" ref={bgWrapRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setBgMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
          >
            <Palette className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Background</span>
          </motion.button>
          <AnimatePresence>
            {bgMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="absolute left-0 top-full z-50 mt-2 min-w-[260px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
              >
                <div className="p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-semibold text-neutral-700">Background</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="mb-2 text-xs font-medium text-neutral-400">Color</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {colors.map((color) => (
                        <motion.button
                          key={color.value}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onSetCanvasBackground?.({ ...canvasBackground, color: color.value })}
                          className={`h-7 w-7 rounded-lg border transition ${
                            canvasBackground?.color === color.value ? "ring-2 ring-black ring-offset-1" : "hover:shadow-md"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-2 text-xs font-medium text-neutral-400">Pattern</div>
                    <div className="flex gap-1.5">
                      {patterns.map((p) => (
                        <motion.button
                          key={p.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSetCanvasBackground?.({ ...canvasBackground, pattern: p.id })}
                          className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition ${
                            canvasBackground?.pattern === p.id
                              ? "border-black bg-black text-white shadow-md"
                              : "border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          {p.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
          >
            <Share2 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Share</span>
          </motion.button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="absolute left-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-2xl border border-neutral-200 bg-white py-1 shadow-xl"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-neutral-50"
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
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-neutral-50"
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
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-neutral-50"
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
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ActionButton icon={Undo2} label="Undo" onClick={onUndo} disabled={!canUndo} />
        <ActionButton icon={Redo2} label="Redo" onClick={onRedo} disabled={!canRedo} />
      </div>
    </div>
  );
}
