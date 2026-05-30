import { Color, Vector2 } from "three";

export const FIELD_SIZE = 420;
export const FIELD_HALF_SIZE = FIELD_SIZE / 2;
export const WATER_LEVEL = 0.18;
export const POND_CENTER = new Vector2(58, -132);

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
};

export const hash2 = (x: number, z: number) => {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const valueNoise = (x: number, z: number) => {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);

  const a = hash2(xi, zi);
  const b = hash2(xi + 1, zi);
  const c = hash2(xi, zi + 1);
  const d = hash2(xi + 1, zi + 1);

  return lerp(lerp(a, b, u), lerp(c, d, u), v);
};

export const fbm = (x: number, z: number, octaves = 4) => {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;

  for (let i = 0; i < octaves; i += 1) {
    value += valueNoise(x * frequency, z * frequency) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }

  return value / total;
};

const distanceToSegment = (
  x: number,
  z: number,
  ax: number,
  az: number,
  bx: number,
  bz: number
) => {
  const abx = bx - ax;
  const abz = bz - az;
  const apx = x - ax;
  const apz = z - az;
  const abLengthSq = abx * abx + abz * abz;
  const t = clamp((apx * abx + apz * abz) / abLengthSq, 0, 1);
  const closestX = ax + abx * t;
  const closestZ = az + abz * t;

  return Math.hypot(x - closestX, z - closestZ);
};

const radialInfluence = (
  x: number,
  z: number,
  centerX: number,
  centerZ: number,
  radius: number,
  feather = 12
) => 1 - smoothstep(radius, radius + feather, Math.hypot(x - centerX, z - centerZ));

const pathInfluence = (
  x: number,
  z: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
  width: number,
  feather = 8
) => 1 - smoothstep(width, width + feather, distanceToSegment(x, z, ax, az, bx, bz));

const rectangleInfluence = (
  x: number,
  z: number,
  centerX: number,
  centerZ: number,
  halfWidth: number,
  halfDepth: number,
  feather = 10
) => {
  const dx = Math.max(Math.abs(x - centerX) - halfWidth, 0);
  const dz = Math.max(Math.abs(z - centerZ) - halfDepth, 0);
  return 1 - smoothstep(0, feather, Math.hypot(dx, dz));
};

export const getPortfolioClearance = (x: number, z: number) => {
  const anchors = [
    radialInfluence(x, z, 0, 0, 28, 16),
    radialInfluence(x, z, -90, -80, 58, 18),
    radialInfluence(x, z, -80, 92, 62, 18),
    radialInfluence(x, z, 22, 92, 58, 18),
    radialInfluence(x, z, 0, 150, 34, 12),
    rectangleInfluence(x, z, 100, -45, 28, 48, 16),
  ];

  const paths = [
    pathInfluence(x, z, -145, 20, 55, 20, 11),
    pathInfluence(x, z, -145, -110, 145, -110, 11),
    pathInfluence(x, z, -40, 150, 55, 150, 11),
    pathInfluence(x, z, -140, -120, -140, 20, 11),
    pathInfluence(x, z, -90, -120, -90, -45, 11),
    pathInfluence(x, z, -50, 0, -50, 150, 11),
    pathInfluence(x, z, 50, 0, 50, 150, 11),
    pathInfluence(x, z, 140, -120, 140, 20, 11),
    pathInfluence(x, z, 0, -36, 0, 150, 11),
  ];

  return clamp(Math.max(...anchors, ...paths), 0, 1);
};

export const getPondRadius = (angle: number) => {
  const organic =
    18.5 +
    Math.sin(angle * 2.0 + 0.4) * 3.2 +
    Math.sin(angle * 3.7 - 1.1) * 2.6 +
    Math.sin(angle * 6.4 + 2.2) * 1.55;

  return organic;
};

export const getPondInfo = (x: number, z: number) => {
  const dx = x - POND_CENTER.x;
  const dz = z - POND_CENTER.y;
  const distance = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const radius = getPondRadius(angle);
  const normalized = distance / radius;
  const inside = normalized < 1;
  const basin = 1 - smoothstep(0.15, 0.98, normalized);
  const bank = 1 - smoothstep(0.92, 1.22, normalized);
  const shore = Math.abs(distance - radius);

  return { angle, bank, basin, distance, inside, normalized, radius, shore };
};

export const getBaseTerrainHeight = (x: number, z: number) => {
  const rollingHills =
    Math.sin(x * 0.024 + z * 0.011) * 0.68 +
    Math.cos(z * 0.031 - x * 0.009) * 0.52 +
    (fbm(x * 0.018, z * 0.018, 5) - 0.5) * 2.35;
  const microUndulation = (fbm(x * 0.092 + 7, z * 0.092 - 4, 3) - 0.5) * 0.45;

  return rollingHills + microUndulation;
};

export const getTerrainHeight = (x: number, z: number) => {
  const base = getBaseTerrainHeight(x, z);
  const pond = getPondInfo(x, z);
  const erodedBank = pond.bank * 0.34;
  const basinDepth = pond.basin * 1.65;
  const muddyShelf = smoothstep(0.72, 1.08, pond.normalized) * pond.bank * 0.18;

  const naturalHeight = base - basinDepth - erodedBank + muddyShelf;
  const portfolioClearance = getPortfolioClearance(x, z);

  return naturalHeight * (1 - portfolioClearance);
};

export const getWaterDepthAt = (x: number, z: number) => {
  const pond = getPondInfo(x, z);
  if (!pond.inside) return 0;
  return Math.max(0, WATER_LEVEL - getTerrainHeight(x, z));
};

export const isWalkablePond = (x: number, z: number) => getPondInfo(x, z).inside;

export const getTerrainColor = (x: number, z: number) => {
  const pond = getPondInfo(x, z);
  const portfolioClearance = getPortfolioClearance(x, z);
  const height = getTerrainHeight(x, z);
  const moss = fbm(x * 0.065 + 15, z * 0.065 - 9, 3);
  const debris = fbm(x * 0.19 - 3, z * 0.19 + 11, 2);
  const grass = new Color("#2f5b31");
  const mossColor = new Color("#506a33");
  const loam = new Color("#3a3023");
  const mud = new Color("#2d241b");
  const sediment = new Color("#3a3328");
  const color = grass.clone().lerp(mossColor, moss * 0.52);

  color.lerp(loam, smoothstep(0.2, 1.8, Math.abs(height)) * 0.32);
  color.offsetHSL(0, 0, (debris - 0.5) * 0.11);
  color.lerp(new Color("#4b4f3b"), portfolioClearance * 0.5);

  if (pond.bank > 0) {
    color.lerp(mud, pond.bank * 0.76);
  }

  if (pond.inside) {
    color.lerp(sediment, pond.basin * 0.9);
  }

  return color;
};

export const createRng = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomSigned = (rng: () => number) => rng() * 2 - 1;
