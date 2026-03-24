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
import { useState } from "react";

const COLOR_PRESETS = [
  { value: "#fef08a", name: "Yellow" },
  { value: "#fbcfe8", name: "Pink" },
  { value: "#bbf7d0", name: "Green" },
  { value: "#a5f3fc", name: "Cyan" },
  { value: "#e9d5ff", name: "Purple" },
  { value: "#fed7aa", name: "Orange" },
  { value: "#ffffff", name: "White" },
  { value: "#171717", name: "Black" },
  { value: "#78716c", name: "Stone" },
  { value: "#3b82f6", name: "Blue" }
];

function SectionTitle({ children }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{children}</p>;
}

function ColorPicker({ value, onChange, label }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Custom color button - rainbow gradient */}
        <div className="relative">
          <motion.button
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setPickerOpen(!pickerOpen)}
            className={`h-8 w-8 rounded-xl border-2 bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 via-cyan-500 to-blue-500 transition-all duration-150 ${
              !COLOR_PRESETS.some((c) => c.value === value)
                ? "ring-2 ring-black/20 shadow-md"
                : "border-neutral-200 hover:shadow-sm"
            }`}
            title="Custom color"
          />
          <AnimatePresence>
            {pickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setPickerOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">Pick color</span>
                    <button
                      onClick={() => setPickerOpen(false)}
                      className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-xl border border-neutral-200 shadow-sm"
                      style={{ backgroundColor: customColor }}
                    />
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="h-10 flex-1 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onChange(customColor);
                      setPickerOpen(false);
                    }}
                    className="w-full rounded-xl bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
                  >
                    Apply
                  </motion.button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        {/* Preset colors */}
        {COLOR_PRESETS.map((color) => (
          <motion.button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`h-8 w-8 rounded-xl border transition-all duration-150 ${
              value === color.value
                ? "border-black ring-2 ring-black/20 shadow-md"
                : "border-neutral-200 hover:shadow-sm"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
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
            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
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
                      max={100}
                      value={st.borderRadius ?? 16}
                      onChange={(e) => onPatchStyle(element.id, { borderRadius: Number(e.target.value) })}
                      className="h-2 flex-1 accent-black"
                    />
                    <span className="w-10 text-right text-sm tabular-nums text-neutral-600">{st.borderRadius ?? 16}px</span>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <ColorPicker label="Fill" value={st.fill ?? "#fde68a"} onChange={(c) => onPatchStyle(element.id, { fill: c })} />
                <ColorPicker label="Outline" value={st.stroke ?? "#292524"} onChange={(c) => onPatchStyle(element.id, { stroke: c })} />
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
                <ColorPicker label="Text color" value={st.color ?? "#171717"} onChange={(c) => onPatchStyle(element.id, { color: c })} />
                <ColorPicker
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
              <ColorPicker label="Frame color" value={st.borderColor ?? "#292524"} onChange={(c) => onPatchStyle(element.id, { borderColor: c })} />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
