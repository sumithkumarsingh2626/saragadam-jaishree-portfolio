import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  ConeGeometry,
  DynamicDrawUsage,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import {
  createRng,
  FIELD_HALF_SIZE,
  getPondInfo,
  getPortfolioClearance,
  getTerrainHeight,
  randomSigned,
} from "../../helpers/forestTerrain";
import { useDispose } from "../../hooks/useDispose";

const BLADE_COUNT = 4200;

type Blade = {
  x: number;
  z: number;
  y: number;
  height: number;
  width: number;
  seed: number;
  lean: number;
  color: Color;
  wet: number;
};

const Grass = () => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => new ConeGeometry(0.06, 1, 5, 1), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#7fa24a",
        roughness: 1,
        metalness: 0,
        vertexColors: true,
      }),
    []
  );

  const blades = useMemo<Blade[]>(() => {
    const rng = createRng(5005);
    const items: Blade[] = [];
    const colors = ["#496f35", "#6f873d", "#809846", "#384f2e", "#9a8d4a"];

    while (items.length < BLADE_COUNT) {
      const x = randomSigned(rng) * FIELD_HALF_SIZE * 0.96;
      const z = randomSigned(rng) * FIELD_HALF_SIZE * 0.96;
      const nearStart = Math.hypot(x, z) < 10;
      const pond = getPondInfo(x, z);
      const portfolioClearance = getPortfolioClearance(x, z);
      if (nearStart || portfolioClearance > 0.42 || (pond.inside && pond.basin > 0.42)) continue;

      const wet = Math.max(0, 1 - Math.abs(pond.normalized - 1) / 0.42);
      const color = new Color(colors[Math.floor(rng() * colors.length)]);
      color.offsetHSL(randomSigned(rng) * 0.025, randomSigned(rng) * 0.08, randomSigned(rng) * 0.07);
      if (wet > 0) color.lerp(new Color("#45572f"), wet * 0.75);

      items.push({
        x,
        z,
        y: getTerrainHeight(x, z),
        height: (0.55 + rng() * 1.45) * (1 + wet * 0.65),
        width: 0.04 + rng() * 0.11,
        seed: rng() * Math.PI * 2,
        lean: randomSigned(rng) * 0.42,
        color,
        wet,
      });
    }

    return items;
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = clock.getElapsedTime();
    blades.forEach((blade, index) => {
      const gust = Math.sin(time * 1.15 + blade.seed + blade.x * 0.025) * 0.18;
      const flutter = Math.sin(time * 3.1 + blade.z * 0.05) * 0.045;
      const sway = gust + flutter + blade.wet * 0.05;

      dummy.position.set(blade.x, blade.y + blade.height / 2, blade.z);
      dummy.rotation.set(sway * 0.28, blade.seed, blade.lean + sway);
      dummy.scale.set(blade.width, blade.height, blade.width * 0.75);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, blade.color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  useDispose([geometry, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, BLADE_COUNT]}
      castShadow
      receiveShadow
      onUpdate={(mesh) => mesh.instanceMatrix.setUsage(DynamicDrawUsage)}
    />
  );
};

export default memo(Grass);
