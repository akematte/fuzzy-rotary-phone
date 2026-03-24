import { AnimatePresence, motion } from "framer-motion";
import {
  Circle,
  CircleDot,
  Diamond,
  Minus,
  Plus,
  SlidersHorizontal,
  Square,
  Triangle,
  Type,
  X
} from "lucide-react";

const COLOR_PRESETS = [
  "#fef08a",
  "#fbcfe8",
  "#bbf7d0",
  "#a5f3fc",
  "#e9d5ff",
  "#fed7aa",
  "#ffffff",
  "#171717",
  "#78716c",
  "#3b82f6"
];

function SectionTitle({ children }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{children}</p>;
}

function ColorRow({ value, onChange, label }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-neutral-600">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 cursor-pointer rounded-lg border border-neutral-200 bg-white p-0.5"
          aria-label={label}
        />
        <div className="flex flex-wrap gap-1">
          {COLOR_PRESETS.map((c) => (
            <motion.button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 520, damping: 22 }}
              className="h-7 w-7 rounded-lg border border-neutral-200 shadow-inner"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const SHAPE_TYPES = [
  { id: "rectangle", label: "Rectangle", Icon: Square },
  { id: "circle", label: "Circle", Icon: Circle },
  { id: "pill", label: "Pill", Icon: CircleDot },
  { id: "triangle", label: "Triangle", Icon: Triangle },
  { id: "diamond", label: "Diamond", Icon: Diamond }
];

export default function ElementInspector({ element, onPatchStyle, onSetShape, onClose }) {
  const st = element?.style ?? {};

  return (
    <AnimatePresence>
      {element && (
        <motion.div
          key={element.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          onMouseDown={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute bottom-4 left-1/2 z-20 max-h-[min(52vh,520px)] w-[min(96vw,560px)] -translate-x-1/2 overflow-y-auto rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-soft backdrop-blur-md"
        >
          <div className="mb-3 flex items-center gap-2 border-b border-neutral-100 pb-3">
            <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
            <span className="text-sm font-semibold text-neutral-900">Element options</span>
            <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {element.type}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="ml-2 rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {element.type === "shape" && (
            <div className="space-y-4">
              <div>
                <SectionTitle>Shape</SectionTitle>
                <div className="grid grid-cols-5 gap-2">
                  {SHAPE_TYPES.map(({ id, label, Icon }) => {
                    const active = (st.shape ?? "rectangle") === id;
                    return (
                      <motion.button
                        key={id}
                        type="button"
                        layout
                        onClick={() =>
                          onSetShape ? onSetShape(element.id, id) : onPatchStyle(element.id, { shape: id })
                        }
                        title={label}
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 420, damping: 26 }}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-medium ${
                          active ? "border-black bg-neutral-900 text-white shadow-md" : "border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        <motion.span
                          animate={{ rotate: active ? [0, -6, 6, 0] : 0 }}
                          transition={{ duration: 0.45, ease: "easeOut" }}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.span>
                        <span className="leading-tight">{label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {st.shape === "rectangle" && (
                <div>
                  <SectionTitle>Roundness</SectionTitle>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={64}
                      value={st.borderRadius ?? 16}
                      onChange={(e) => onPatchStyle(element.id, { borderRadius: Number(e.target.value) })}
                      className="h-2 flex-1 accent-black"
                    />
                    <span className="w-10 text-right text-sm tabular-nums text-neutral-600">{st.borderRadius ?? 16}px</span>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <ColorRow label="Fill" value={st.fill ?? "#fde68a"} onChange={(c) => onPatchStyle(element.id, { fill: c })} />
                <ColorRow label="Outline" value={st.stroke ?? "#292524"} onChange={(c) => onPatchStyle(element.id, { stroke: c })} />
              </div>

              <div>
                <SectionTitle>Outline width</SectionTitle>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={12}
                    value={st.strokeWidth ?? 2}
                    onChange={(e) => onPatchStyle(element.id, { strokeWidth: Number(e.target.value) })}
                    className="h-2 flex-1 accent-black"
                  />
                  <span className="w-8 text-right text-sm tabular-nums text-neutral-600">{st.strokeWidth ?? 2}</span>
                </div>
              </div>

              <div>
                <SectionTitle>Opacity</SectionTitle>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={st.opacity ?? 1}
                    onChange={(e) => onPatchStyle(element.id, { opacity: Number(e.target.value) })}
                    className="h-2 flex-1 accent-black"
                  />
                  <span className="w-10 text-right text-sm tabular-nums text-neutral-600">{Math.round((st.opacity ?? 1) * 100)}%</span>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  checked={st.shadow !== false}
                  onChange={(e) => onPatchStyle(element.id, { shadow: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 accent-black"
                />
                Soft shadow
              </label>
            </div>
          )}

          {element.type === "text" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Type className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-800">Typography</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/80 p-2">
                <button
                  type="button"
                  onClick={() =>
                    onPatchStyle(element.id, { fontSize: Math.max(12, (st.fontSize ?? 16) - 2) })
                  }
                  className="rounded-xl border border-neutral-200 bg-white p-2 hover:bg-neutral-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-12 text-center text-sm tabular-nums">{st.fontSize ?? 16}px</span>
                <button
                  type="button"
                  onClick={() => onPatchStyle(element.id, { fontSize: (st.fontSize ?? 16) + 2 })}
                  className="rounded-xl border border-neutral-200 bg-white p-2 hover:bg-neutral-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onPatchStyle(element.id, { bold: !st.bold })}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white ${st.bold ? "border-black bg-white" : "border-neutral-200 bg-white"}`}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => onPatchStyle(element.id, { italic: !st.italic })}
                  className={`rounded-xl border px-3 py-2 text-sm italic hover:bg-white ${st.italic ? "border-black bg-white" : "border-neutral-200 bg-white"}`}
                >
                  I
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorRow label="Text color" value={st.color ?? "#171717"} onChange={(c) => onPatchStyle(element.id, { color: c })} />
                <ColorRow
                  label="Background"
                  value={st.background === "transparent" ? "#ffffff" : st.background ?? "#ffffff"}
                  onChange={(c) => onPatchStyle(element.id, { background: c })}
                />
              </div>
              <button
                type="button"
                onClick={() => onPatchStyle(element.id, { background: "transparent" })}
                className="text-xs font-medium text-neutral-600 underline-offset-2 hover:text-black hover:underline"
              >
                Clear text background
              </button>
            </div>
          )}

          {element.type === "image" && (
            <div className="space-y-4">
              <div>
                <SectionTitle>Corner roundness</SectionTitle>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={48}
                    value={st.borderRadius ?? 16}
                    onChange={(e) => onPatchStyle(element.id, { borderRadius: Number(e.target.value) })}
                    className="h-2 flex-1 accent-black"
                  />
                  <span className="w-10 text-right text-sm tabular-nums text-neutral-600">{st.borderRadius ?? 16}px</span>
                </div>
              </div>
              <div>
                <SectionTitle>Frame</SectionTitle>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={8}
                    value={st.borderWidth ?? 0}
                    onChange={(e) => onPatchStyle(element.id, { borderWidth: Number(e.target.value) })}
                    className="h-2 flex-1 accent-black"
                  />
                  <span className="w-8 text-right text-sm tabular-nums text-neutral-600">{st.borderWidth ?? 0}px</span>
                </div>
              </div>
              <ColorRow label="Frame color" value={st.borderColor ?? "#292524"} onChange={(c) => onPatchStyle(element.id, { borderColor: c })} />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
