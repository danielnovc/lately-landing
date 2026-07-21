/** Shared path ↔ memory attachment helpers (mirrors lately-app JourneyPathView). */

export type Point = { x: number; y: number };
export type LineSeg = { x1: number; y1: number; x2: number; y2: number };

export const POLAROID = { width: 132, height: 136 } as const;
export const PAPER = { width: 164, height: 74 } as const;
export const NODE_GAP = 72;
export const NODE_CLEARANCE = 16;
export const PREVIEW_CLEARANCE = 10;

export function getInsetLine({
  start,
  end,
  startInset,
  endInset,
}: {
  start: Point;
  end: Point;
  startInset: number;
  endInset: number;
}): LineSeg | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= 1) return null;

  const ux = dx / distance;
  const uy = dy / distance;
  const actualStartInset = Math.min(startInset, Math.max((distance - 1) / 2, 0));
  const actualEndInset = Math.min(
    endInset,
    Math.max(distance - actualStartInset - 1, 0),
  );

  return {
    x1: start.x + ux * actualStartInset,
    y1: start.y + uy * actualStartInset,
    x2: end.x - ux * actualEndInset,
    y2: end.y - uy * actualEndInset,
  };
}

export function connectorGradientStops() {
  return [
    { offset: "0%", opacity: 0.72 },
    { offset: "72%", opacity: 0.36 },
    { offset: "100%", opacity: 0.08 },
  ] as const;
}
