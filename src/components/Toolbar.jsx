import { motion } from "framer-motion";
import { ImagePlus, Redo2, Type, Undo2 } from "lucide-react";

function ActionButton({ icon: Icon, label, onClick, disabled = false }) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4" />
      {label}
    </motion.button>
  );
}

export default function Toolbar({
  onAddText,
  onAddImage,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <ActionButton icon={Type} label="Add Text" onClick={onAddText} />
        <ActionButton icon={ImagePlus} label="Add Image" onClick={onAddImage} />
      </div>
      <div className="flex items-center gap-2">
        <ActionButton icon={Undo2} label="Undo" onClick={onUndo} disabled={!canUndo} />
        <ActionButton icon={Redo2} label="Redo" onClick={onRedo} disabled={!canRedo} />
      </div>
    </div>
  );
}
