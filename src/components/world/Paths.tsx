import React from "react";
import Path from "../../base/Path";
import Fence from "../../base/Fence";

type PathDef = { count: number; start: number; x?: number; z?: number };

const PATH_DEFS: PathDef[] = [
  { count: 6,  x: 1,    start: 0   },
  { count: 35, z: 20,   start: 1   },
  { count: 35, z: 20,   start: -36 },
  { count: 30, x: 50,   start: 7   },
  { count: 30, x: -50,  start: 7   },
  { count: 35, z: 150,  start: 0   },
  { count: 35, z: 150,  start: -35 },
  { count: 30, x: 50,   start: -25 },
  { count: 35, z: -110, start: 0   },
  { count: 35, z: -110, start: -35 },
  { count: 30, x: 140,  start: -25 },
  { count: 30, x: -140, start: -25 },
  { count: 30, x: 140,  start: 7   },
  { count: 30, x: -140, start: 7   },
  { count: 30, x: -90,  start: -25 },
  { count: 20, x: -90,  start: -48 },
];

// ── Fence world-space positions (ORIGINAL tight offsets) ───────────────────
// x-path: left fence at x-5, right fence at x+3
// z-path: left fence at z-3, right fence at z+5
interface FenceLine {
  axis:    "z" | "x"; // z = runs along Z (x-path), x = runs along X (z-path)
  fixed:   number;    // constant coord (X for z-fences, Z for x-fences)
  from:    number;
  to:      number;
  pathIdx: number;
  side:    "left" | "right";
}

function buildFenceLines(): FenceLine[] {
  const lines: FenceLine[] = [];
  PATH_DEFS.forEach((p, pathIdx) => {
    const len = p.count * 4;
    if (p.x !== undefined) {
      const zFrom = p.start * 4;
      const zTo   = zFrom + len;
      lines.push({ axis: "z", fixed: p.x - 5, from: zFrom, to: zTo, pathIdx, side: "left"  });
      lines.push({ axis: "z", fixed: p.x + 3, from: zFrom, to: zTo, pathIdx, side: "right" });
    } else if (p.z !== undefined) {
      const xFrom = p.start * 4;
      const xTo   = xFrom + len;
      lines.push({ axis: "x", fixed: p.z - 3, from: xFrom, to: xTo, pathIdx, side: "left"  });
      lines.push({ axis: "x", fixed: p.z + 5, from: xFrom, to: xTo, pathIdx, side: "right" });
    }
  });
  return lines;
}

const ALL_FENCES = buildFenceLines();

type Gap = { start: number; end: number };

const GAP_HALF = 8; // half-width of cut at any intersection

function getFenceGaps(fence: FenceLine): Gap[] {
  const len    = fence.to - fence.from;
  const centre = fence.from + len / 2;
  const gaps: Gap[] = [];

  ALL_FENCES.forEach((other) => {
    if (other.pathIdx === fence.pathIdx) return; // same path – skip
    if (other.axis   === fence.axis)     return; // parallel – can't cross

    // For two perpendicular fence lines:
    // fence: fixed=A, range=[fence.from, fence.to]
    // other: fixed=B, range=[other.from, other.to]
    // They cross iff A ∈ [other.from, other.to] AND B ∈ [fence.from, fence.to]
    const myInOther   = fence.fixed >= other.from && fence.fixed <= other.to;
    const otherInMine = other.fixed >= fence.from && other.fixed <= fence.to;

    if (myInOther && otherInMine) {
      const localCross = other.fixed - centre;
      gaps.push({ start: localCross - GAP_HALF, end: localCross + GAP_HALF });
    }
  });

  return gaps;
}

const ALL_FENCE_GAPS: Gap[][] = ALL_FENCES.map(getFenceGaps);

function gapsForPath(i: number): { leftGaps: Gap[]; rightGaps: Gap[] } {
  const leftIdx  = ALL_FENCES.findIndex((f) => f.pathIdx === i && f.side === "left");
  const rightIdx = ALL_FENCES.findIndex((f) => f.pathIdx === i && f.side === "right");
  return {
    leftGaps:  leftIdx  >= 0 ? ALL_FENCE_GAPS[leftIdx]  : [],
    rightGaps: rightIdx >= 0 ? ALL_FENCE_GAPS[rightIdx] : [],
  };
}

// ── Component ──────────────────────────────────────────────────────────────────
interface FencedPathProps extends PathDef {
  leftGaps:  Gap[];
  rightGaps: Gap[];
}

const FencedPath: React.FC<FencedPathProps> = ({
  start, count, x, z, leftGaps, rightGaps,
}) => {
  const len = count * 4;
  let leftPos:  [number, number, number] = [0, 0, 0];
  let rightPos: [number, number, number] = [0, 0, 0];
  let rot:      [number, number, number] = [0, 0, 0];

  if (x !== undefined) {
    const zCentre = start * 4 + len / 2;
    leftPos  = [x - 5, 0, zCentre];
    rightPos = [x + 3, 0, zCentre];
    rot = [0, 0, 0];
  } else if (z !== undefined) {
    const xCentre = start * 4 + len / 2;
    leftPos  = [xCentre, 0, z - 3];
    rightPos = [xCentre, 0, z + 5];
    rot = [0, Math.PI / 2, 0];
  }

  return (
    <>
      <Path count={count} x={x} z={z} start={start} />
      <Fence position={leftPos}  length={len} rotation={rot} gaps={leftGaps}  />
      <Fence position={rightPos} length={len} rotation={rot} gaps={rightGaps} />
    </>
  );
};

const PathMesh: React.FC = () => (
  <>
    {PATH_DEFS.map((p, i) => {
      const { leftGaps, rightGaps } = gapsForPath(i);
      return (
        <FencedPath
          key={i}
          {...p}
          leftGaps={leftGaps}
          rightGaps={rightGaps}
        />
      );
    })}
  </>
);

export default PathMesh;
