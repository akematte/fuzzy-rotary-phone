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

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 0, b: 0 };
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToRgb(h, s, v) {
  h /= 360; s /= 100; v /= 100;
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

function ColorPicker({ value, onChange, label }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hsv, setHsv] = useState(rgbToHsv(...Object.values(hexToRgb(value))));
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  const handleSaturationValueChange = (clientX, clientY) => {
    const rect = pickerRef.current?.querySelector("[data-sv-picker]")?.getBoundingClientRect();
    if (!rect) return;
    const s = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const v = Math.max(0, Math.min(100, 100 - ((clientY - rect.top) / rect.height) * 100));
    setHsv(prev => {
      const rgb = hsvToRgb(prev.h, s, v);
      onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
      return { ...prev, s, v };
    });
  };

  const handleHueChange = (clientY) => {
    const rect = pickerRef.current?.querySelector("[data-hue-slider]")?.getBoundingClientRect();
    if (!rect) return;
    const h = Math.max(0, Math.min(360, ((clientY - rect.top) / rect.height) * 360));
    setHsv(prev => {
      const rgb = hsvToRgb(h, prev.s, prev.v);
      onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
      return { ...prev, h };
    });
  };

  const currentRgb = hexToRgb(value);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Custom color button - rainbow gradient */}
        <div className="relative" ref={pickerRef}>
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl"
              >
                {/* Saturation/Value picker */}
                <div
                  data-sv-picker
                  className="relative mb-3 h-32 w-full cursor-crosshair overflow-hidden rounded-xl"
                  style={{
                    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                    backgroundImage: `
                      linear-gradient(to right, white, transparent),
                      linear-gradient(to top, black, transparent)
                    `
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSaturationValueChange(e.clientX, e.clientY);
                    const onMouseMove = (moveEvent) => {
                      handleSaturationValueChange(moveEvent.clientX, moveEvent.clientY);
                    };
                    const onMouseUp = () => {
                      window.removeEventListener("mousemove", onMouseMove);
                      window.removeEventListener("mouseup", onMouseUp);
                    };
                    window.addEventListener("mousemove", onMouseMove);
                    window.addEventListener("mouseup", onMouseUp);
                  }}
                >
                  <div
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                    style={{
                      left: `${hsv.s}%`,
                      top: `${100 - hsv.v}%`
                    }}
                  />
                </div>

                {/* Hue slider */}
                <div
                  data-hue-slider
                  className="relative mb-3 h-4 w-full cursor-pointer overflow-hidden rounded-full"
                  style={{
                    background: "linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleHueChange(e.clientY);
                    const onMouseMove = (moveEvent) => {
                      handleHueChange(moveEvent.clientY);
                    };
                    const onMouseUp = () => {
                      window.removeEventListener("mousemove", onMouseMove);
                      window.removeEventListener("mouseup", onMouseUp);
                    };
                    window.addEventListener("mousemove", onMouseMove);
                    window.addEventListener("mouseup", onMouseUp);
                  }}
                >
                  <div
                    className="absolute left-0 right-0 h-6 -translate-y-1/2"
                    style={{ top: `${(hsv.h / 360) * 100}%` }}
                  >
                    <div className="mx-auto h-0.5 w-full bg-black/30" />
                  </div>
                </div>

                {/* Color preview */}
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-xl border border-neutral-200 shadow-sm"
                    style={{ backgroundColor: value }}
                  />
                  <input
                    type="text"
                    value={value.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                        onChange(val);
                        if (val.length === 7) {
                          setHsv(rgbToHsv(...Object.values(hexToRgb(val))));
                        }
                      }
                    }}
                    className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono uppercase outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </div>

                {/* RGB inputs */}
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {["R", "G", "B"].map((channel, i) => (
                    <div key={channel} className="relative">
                      <label className="mb-1 block text-[10px] font-medium text-neutral-500">{channel}</label>
                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={i === 0 ? currentRgb.r : i === 1 ? currentRgb.g : currentRgb.b}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                          const rgb = i === 0 ? { r: val, g: currentRgb.g, b: currentRgb.b }
                            : i === 1 ? { r: currentRgb.r, g: val, b: currentRgb.b }
                            : { r: currentRgb.r, g: currentRgb.g, b: val };
                          onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
                          setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
                        }}
                        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs tabular-nums outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  ))}
                </div>

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPickerOpen(false)}
                  className="w-full rounded-xl bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
                >
                  Done
                </motion.button>
              </motion.div>
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
