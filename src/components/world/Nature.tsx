import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import { InstancedMesh, Matrix4, Vector3, Quaternion, Color, DoubleSide } from "three";

const NUM_BIRDS = 50;

// Fence line data: { x, z, length, axis }
// axis "z" = fence runs along Z axis (fixed x), axis "x" = fence runs along X axis (fixed z)
// These positions mirror what FencedPath generates:
// For x-based path:  leftFence at x-5, rightFence at x+5
// For z-based path:  leftFence at z-5, rightFence at z+5
const FENCE_LINES: { axis: "x" | "z"; fixed: number; from: number; to: number }[] = [
  // x=1 path (vertical, 6 tiles, start=0) — fences at x=-4 and x=6
  { axis: "z", fixed: -4,  from: -2,    to: 22 },
  { axis: "z", fixed:  6,  from: -2,    to: 22 },
  // z=20 paths (horizontal, 35 tiles, start=1 and -36)
  { axis: "x", fixed: 15,  from:  4,   to: 140 },
  { axis: "x", fixed: 25,  from:  4,   to: 140 },
  { axis: "x", fixed: 15,  from: -140, to: -4 },
  { axis: "x", fixed: 25,  from: -140, to: -4 },
];

// Generate flower positions along fence lines
const buildFlowerPositions = () => {
  const positions: [number, number, number][] = [];
  const palette = ["#ff6b6b", "#feca57", "#ff9ff3", "#ff7eb3", "#ffffff", "#a29bfe"];
  const cols: [number, number, number][] = [];

  FENCE_LINES.forEach(({ axis, fixed, from, to }) => {
    const lineLength = to - from;
    const count = Math.floor(lineLength / 1.8); // flower every ~1.8 units
    for (let i = 0; i < count; i++) {
      const t = from + i * 1.8 + Math.random() * 0.6 - 0.3;
      // Place flowers 1.5 units inward from fence so they're inside the fence
      const inward = 1.5;
      let wx: number, wz: number;
      if (axis === "z") {
        // fence runs along Z, fixed is X
        wx = fixed > 0 ? fixed - inward : fixed + inward;
        wz = t;
      } else {
        // fence runs along X, fixed is Z
        wx = t;
        wz = fixed > 20 ? fixed - inward : fixed + inward;
      }
      positions.push([wx, 0.05, wz]);
      const c = new Color(palette[Math.floor(Math.random() * palette.length)]);
      cols.push([c.r, c.g, c.b]);
    }
  });

  return { positions, cols };
};

const { positions: FLOWER_POSITIONS, cols: FLOWER_COLORS } = buildFlowerPositions();
const NUM_FLOWERS = FLOWER_POSITIONS.length;

// Butterfly anchor points – 18 points spread along the fence lines
const BUTTERFLY_ANCHORS: [number, number, number][] = (() => {
  const pts: [number, number, number][] = [];
  FENCE_LINES.forEach(({ axis, fixed, from, to }) => {
    const step = (to - from) / 3;
    for (let i = 0; i < 3; i++) {
      const t = from + step * i + step * 0.5;
      if (axis === "z") pts.push([fixed, 1.0, t]);
      else               pts.push([t, 1.0, fixed]);
      if (pts.length >= 18) return;
    }
  });
  return pts.slice(0, 18);
})();
const NUM_BUTTERFLIES = BUTTERFLY_ANCHORS.length;

/* ─────────────────────────── Flowers ─────────────────────────── */
export const Flowers = () => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy  = useMemo(() => new Matrix4(), []);
  const colorArray = useMemo(
    () => new Float32Array(FLOWER_COLORS.flat()),
    []
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    FLOWER_POSITIONS.forEach(([x, y, z], i) => {
      const s = 0.35 + Math.random() * 0.45;
      dummy.makeTranslation(x, y, z);
      dummy.scale(new Vector3(s, s, s));
      dummy.multiply(new Matrix4().makeRotationY(Math.random() * Math.PI * 2));
      mesh.setMatrixAt(i, dummy);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, NUM_FLOWERS]}>
      <dodecahedronGeometry args={[0.22, 0]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </dodecahedronGeometry>
      <meshStandardMaterial roughness={0.7} vertexColors />
    </instancedMesh>
  );
};

/* ─────────────────────────── Butterflies ─────────────────────── */
export const Butterflies = () => {
  const meshRef   = useRef<InstancedMesh>(null);
  const dummy     = useMemo(() => new Matrix4(), []);
  const pos       = useMemo(() => new Vector3(), []);
  const quat      = useMemo(() => new Quaternion(), []);
  const scl       = useMemo(() => new Vector3(), []);

  const bData = useMemo(() =>
    BUTTERFLY_ANCHORS.map((anchor, i) => ({
      ax: anchor[0], ay: anchor[1], az: anchor[2],
      speed:  1.2 + Math.random() * 1.5,
      offset: (i / NUM_BUTTERFLIES) * Math.PI * 2,
      sc:     0.18 + Math.random() * 0.14,
    })), []);

  const colorArray = useMemo(() => {
    const palette = ["#ff9a9e", "#fecfef", "#a1c4fd", "#fdcbf1", "#c3f0ca"];
    return new Float32Array(
      Array.from({ length: NUM_BUTTERFLIES }).flatMap(() => {
        const c = new Color(palette[Math.floor(Math.random() * palette.length)]);
        return [c.r, c.g, c.b];
      })
    );
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    bData.forEach((b, i) => {
      const x = b.ax + Math.sin(t * 0.7 + b.offset) * 2.5;
      const z = b.az + Math.cos(t * 0.5 + b.offset) * 2.5;
      const y = b.ay + Math.sin(t * b.speed + b.offset) * 0.6;
      const flap = Math.abs(Math.sin(t * 12 + b.offset));
      pos.set(x, y, z);
      quat.setFromAxisAngle(new Vector3(0, 1, 0), t * 0.4 + b.offset);
      scl.set(b.sc, b.sc, b.sc * (0.15 + flap * 0.85));
      dummy.compose(pos, quat, scl);
      mesh.setMatrixAt(i, dummy);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, NUM_BUTTERFLIES]}>
      <boxGeometry args={[0.45, 0.03, 0.32]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </boxGeometry>
      <meshStandardMaterial roughness={0.3} vertexColors transparent opacity={0.92} side={DoubleSide} />
    </instancedMesh>
  );
};

/* ─────────────────────────── Birds ──────────────────────────── */
export const Birds = () => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy   = useMemo(() => new Matrix4(), []);
  const pos     = useMemo(() => new Vector3(), []);
  const quat    = useMemo(() => new Quaternion(), []);
  const scl     = useMemo(() => new Vector3(), []);

  const bData = useMemo(() =>
    Array.from({ length: NUM_BIRDS }).map(() => ({
      radius:    60 + Math.random() * 100,
      angle:     Math.random() * Math.PI * 2,
      height:    28 + Math.random() * 18,
      speed:     0.18 + Math.random() * 0.25,
      flapSpeed: 8 + Math.random() * 6,
      sc:        1 + Math.random() * 1,
      offset:    Math.random() * 100,
    })), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    bData.forEach((b, i) => {
      const ang = b.angle + t * b.speed;
      const x = Math.cos(ang) * b.radius;
      const z = Math.sin(ang) * b.radius;
      const y = b.height + Math.sin(t + b.offset) * 2;
      const flap = Math.sin(t * b.flapSpeed + b.offset);
      pos.set(x, y, z);
      quat.setFromAxisAngle(new Vector3(0, 1, 0), -ang);
      quat.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), flap * 0.25));
      scl.set(b.sc, b.sc, b.sc);
      dummy.compose(pos, quat, scl);
      mesh.setMatrixAt(i, dummy);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, NUM_BIRDS]}>
      <coneGeometry args={[0.45, 1.4, 3]} />
      <meshStandardMaterial color="#2d3436" roughness={0.8} />
    </instancedMesh>
  );
};

const Nature = () => (
  <>
    <Flowers />
    <Butterflies />
    <Birds />
  </>
);

export default Nature;
