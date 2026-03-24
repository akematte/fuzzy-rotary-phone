const GRID = 12;

export const snap = (value) => Math.round(value / GRID) * GRID;

/** Pick dimensions + position so the shape reads well after changing type. Keeps visual center. */
export function fitShapeBox(element, nextShape) {
  const w = element.width ?? 200;
  const h = element.height ?? 200;
  const x = element.x ?? 0;
  const y = element.y ?? 0;
  const cx = x + w / 2;
  const cy = y + h / 2;

  let nw = w;
  let nh = h;

  switch (nextShape) {
    case "circle": {
      const s = Math.max(GRID, snap(Math.max(w, h)));
      nw = s;
      nh = s;
      break;
    }
    case "pill": {
      if (w >= h) {
        nh = Math.max(GRID, snap(h));
        nw = Math.max(GRID, snap(Math.max(w, nh * 2.25)));
      } else {
        nw = Math.max(GRID, snap(w));
        nh = Math.max(GRID, snap(Math.max(h, nw * 2.25)));
      }
      break;
    }
    case "triangle":
    case "diamond": {
      const s = Math.max(GRID, snap(Math.max(w, h, 168)));
      nw = s;
      nh = s;
      break;
    }
    default: {
      nw = Math.max(GRID * 9, snap(w));
      nh = Math.max(GRID * 5, snap(h));
    }
  }

  const nx = snap(cx - nw / 2);
  const ny = snap(cy - nh / 2);
  return { x: nx, y: ny, width: nw, height: nh };
}
