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
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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
  const [hsv, setHsv] = useState({ h: 0, s: 100, v: 100 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hexInput, setHexInput] = useState(value);

  useEffect(() => {
    if (!value.startsWith("#")) return;
    const hex = value.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (max !== min) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    setHsv({ h: h * 360, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 });
    setHexInput(value.toUpperCase());
  }, [value]);

  useEffect(() => {
    if (!pickerOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.color-picker-portal')) {
        setPickerOpen(false);
      }
    };
    setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 100);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  const hsvToRgb = (h, s, v) => {
    h /= 360; s /= 100; v /= 100;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
      default: r = 0; g = 0; b = 0;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const updateColor = (newHsv) => {
    setHsv(newHsv);
    const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const hex = "#" + [rgb.r, rgb.g, rgb.b].map(x => x.toString(16).padStart(2, "0")).join("");
    onChange(hex);
    setHexInput(hex.toUpperCase());
  };

  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    // Accept with or without # prefix
    const hexVal = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(hexVal)) {
      const r = parseInt(hexVal.substr(1, 2), 16) / 255;
      const g = parseInt(hexVal.substr(3, 2), 16) / 255;
      const b = parseInt(hexVal.substr(5, 2), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const d = max - min;
      let h = 0;
      if (max !== min) {
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      setHsv({ h: h * 360, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 });
      onChange(hexVal.toUpperCase());
    }
  };

  const handleHexInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const hexVal = hexInput.startsWith('#') ? hexInput : '#' + hexInput;
      if (/^#[0-9A-F]{6}$/i.test(hexVal)) {
        onChange(hexVal.toUpperCase());
        setPickerOpen(false);
      }
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setHexInput(value.toUpperCase());
    setPosition({ x: e.clientX + 10, y: e.clientY - 290 });
    setPickerOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClick}
          className={`h-8 w-8 rounded-xl border-2 bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 via-cyan-500 to-blue-500 transition-colors ${
            !COLOR_PRESETS.some((c) => c.value === value) ? "ring-2 ring-black/20 shadow-md" : "border-neutral-200"
          }`}
          title="Custom color"
        />
        {COLOR_PRESETS.map((color) => (
          <motion.button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className={`h-8 w-8 rounded-xl border transition-colors ${value === color.value ? "border-black ring-2 ring-black/20 shadow-md" : "border-neutral-200"}`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
      {typeof window !== 'undefined' && pickerOpen && createPortal(
        <div className="color-picker-portal fixed z-[9999] w-52 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl" style={{ left: position.x, top: position.y }}>
          <div className="relative mb-3 h-32 w-full cursor-crosshair rounded-xl" style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)`, backgroundImage: "linear-gradient(to right, white, transparent), linear-gradient(to top, black, transparent)" }}
            onMouseDown={(e) => {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              const s = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              const v = Math.max(0, Math.min(100, 100 - ((e.clientY - rect.top) / rect.height) * 100));
              updateColor({ ...hsv, s, v });
              const onMove = (m) => {
                const s2 = Math.max(0, Math.min(100, ((m.clientX - rect.left) / rect.width) * 100));
                const v2 = Math.max(0, Math.min(100, 100 - ((m.clientY - rect.top) / rect.height) * 100));
                updateColor({ ...hsv, s: s2, v: v2 });
              };
              const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          >
            <div className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }} />
          </div>
          <div className="relative mb-3 h-3 w-full cursor-pointer rounded-full" style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
            onMouseDown={(e) => {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
              updateColor({ ...hsv, h });
              const onMove = (m) => { const h2 = Math.max(0, Math.min(360, ((m.clientX - rect.left) / rect.width) * 360)); updateColor({ ...hsv, h: h2 }); };
              const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          >
            <div className="absolute top-0 h-full w-1 -translate-x-1/2 rounded-full bg-white" style={{ left: `${(hsv.h / 360) * 100}%` }} />
          </div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 flex-none rounded-lg border" style={{ backgroundColor: hexInput }} />
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              onKeyDown={handleHexInputKeyDown}
              className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs font-mono uppercase outline-none focus:border-black focus:ring-1 focus:ring-black"
              placeholder="#000000"
              maxLength={7}
            />
          </div>
          <button onClick={() => setPickerOpen(false)} className="w-full rounded-xl bg-black px-3 py-2 text-xs font-medium text-white">Done</button>
        </div>,
        document.body
      )}
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
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onMouseDown={(e) => e.stopPropagation()}
          className="pointer-events-auto fixed bottom-4 right-4 z-20 max-h-[min(52vh,520px)] w-[min(calc(100vw-32px),560px)] max-w-md overflow-y-auto rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-soft backdrop-blur-md"
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
