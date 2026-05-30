import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, Color, Group, RepeatWrapping } from "three";
import {
  createRng,
  FIELD_HALF_SIZE,
  getPondInfo,
  getPortfolioClearance,
  getTerrainHeight,
  randomSigned,
} from "../../helpers/forestTerrain";

type TreeSpecies = "fir" | "oak" | "birch" | "cedar";

type TreeInstance = {
  position: [number, number, number];
  scale: number;
  rotation: number;
  trunkHeight: number;
  trunkRadius: number;
  crownRadius: number;
  species: TreeSpecies;
  barkColor: string;
  foliageColor: string;
  foliageAccent: string;
  seed: number;
};

const createTexture = (base: string, streak: string, seed: number) => {
  if (typeof document === "undefined") return undefined;

  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 192;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 95; i += 1) {
    const x = (Math.sin(seed + i * 12.9898) * 43758.5453) % canvas.width;
    const width = 1 + ((i * 7 + seed * 13) % 5);
    ctx.globalAlpha = 0.16 + (i % 7) * 0.025;
    ctx.fillStyle = i % 3 === 0 ? streak : "#111b12";
    ctx.fillRect(Math.abs(x), 0, width, canvas.height);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1.8, 3.5);
  return texture;
};

const createTreeInstances = () => {
  const rng = createRng(7301);
  const trees: TreeInstance[] = [];

  while (trees.length < 132) {
    const x = randomSigned(rng) * FIELD_HALF_SIZE * 0.95;
    const z = randomSigned(rng) * FIELD_HALF_SIZE * 0.95;
    const centerClearing = Math.hypot(x, z) < 18;
    const portfolioClearance = getPortfolioClearance(x, z);
    const pond = getPondInfo(x, z);
    if (centerClearing || portfolioClearance > 0.18 || pond.normalized < 1.16) continue;

    const distanceFromCenter = Math.hypot(x, z) / FIELD_HALF_SIZE;
    const speciesRoll = rng();
    const species: TreeSpecies =
      speciesRoll > 0.78 ? "birch" : speciesRoll > 0.52 ? "oak" : speciesRoll > 0.18 ? "fir" : "cedar";
    const mature = 0.82 + rng() * 1.35 + distanceFromCenter * 0.55;
    const hue = species === "birch" ? 0.29 : species === "oak" ? 0.25 : 0.33;
    const foliage = new Color().setHSL(hue + randomSigned(rng) * 0.018, 0.36 + rng() * 0.12, 0.19 + rng() * 0.08);
    const accent = foliage.clone().offsetHSL(-0.025, 0.05, 0.065);

    trees.push({
      position: [x, getTerrainHeight(x, z) - 0.04, z],
      scale: mature,
      rotation: rng() * Math.PI * 2,
      trunkHeight: species === "fir" || species === "cedar" ? 5.8 + rng() * 4.4 : 4.8 + rng() * 3.8,
      trunkRadius: 0.26 + rng() * 0.28,
      crownRadius: 1.8 + rng() * 1.8,
      species,
      barkColor: species === "birch" ? "#d8d1bf" : ["#4d3425", "#5b3d29", "#3f3026"][Math.floor(rng() * 3)],
      foliageColor: foliage.getStyle(),
      foliageAccent: accent.getStyle(),
      seed: rng() * Math.PI * 2,
    });
  }

  return trees;
};

const Roots = ({
  radius,
  color,
  barkMap,
}: {
  radius: number;
  color: string;
  barkMap?: CanvasTexture;
}) => {
  return (
    <group>
      {Array.from({ length: 5 }).map((_, index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <mesh
            key={index}
            castShadow
            receiveShadow
            position={[Math.cos(angle) * radius * 0.86, 0.08, Math.sin(angle) * radius * 0.86]}
            rotation={[0.18, -angle + Math.PI / 2, Math.PI / 2]}
            scale={[1, 0.72, 1]}
          >
            <cylinderGeometry args={[radius * 0.13, radius * 0.04, radius * 2.0, 10]} />
            <meshStandardMaterial color={color} map={barkMap} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
};

const FoliageCluster = ({
  color,
  accent,
  radius,
  species,
  foliageMap,
}: {
  color: string;
  accent: string;
  radius: number;
  species: TreeSpecies;
  foliageMap?: CanvasTexture;
}) => {
  if (species === "fir" || species === "cedar") {
    return (
      <group>
        {[0, 1, 2, 3, 4, 5, 6].map((layer) => {
          const width = radius * (1.22 - layer * 0.12);
          const height = radius * (1.1 - layer * 0.035);
          return (
            <mesh
              key={layer}
              castShadow
              receiveShadow
              position={[
                Math.sin(layer * 1.7) * radius * 0.055,
                layer * radius * 0.36,
                Math.cos(layer * 1.3) * radius * 0.045,
              ]}
              rotation={[0.04 * Math.sin(layer), layer * 0.42, 0.035 * Math.cos(layer)]}
              scale={[1, 0.86 + layer * 0.025, 0.88 + (layer % 2) * 0.12]}
            >
              <coneGeometry args={[width, height, 30, 7]} />
              <meshStandardMaterial
                color={layer % 2 ? accent : color}
                map={foliageMap}
                roughness={0.98}
                metalness={0}
              />
            </mesh>
          );
        })}
        {[0, 1, 2, 3, 4, 5].map((branch) => {
          const angle = (branch / 6) * Math.PI * 2;
          return (
            <mesh
              key={`branch-${branch}`}
              castShadow
              receiveShadow
              position={[Math.cos(angle) * radius * 0.38, radius * 0.62, Math.sin(angle) * radius * 0.38]}
              rotation={[Math.PI / 2.7, angle, 0]}
              scale={[0.14, 0.46, 0.14]}
            >
              <coneGeometry args={[radius * 0.36, radius * 1.15, 16, 4]} />
              <meshStandardMaterial color={accent} map={foliageMap} roughness={1} />
            </mesh>
          );
        })}
      </group>
    );
  }

  return (
    <group>
      {[
        [0, 0, 0],
        [0.9, -0.08, 0.22],
        [-0.82, 0.12, -0.05],
        [0.18, 0.42, -0.85],
        [-0.16, 0.58, 0.9],
        [0.05, 0.88, 0.1],
      ].map(([x, y, z], index) => (
        <mesh
          key={index}
          castShadow
          receiveShadow
          position={[x * radius, y * radius, z * radius]}
          scale={[1.2, 0.72 + index * 0.035, 1.05]}
        >
          <icosahedronGeometry args={[radius * (0.58 + (index % 3) * 0.05), 2]} />
          <meshStandardMaterial color={index % 2 ? accent : color} roughness={0.96} metalness={0} />
        </mesh>
      ))}
    </group>
  );
};

const Tree = ({
  instance,
  barkMap,
  foliageMap,
}: {
  instance: TreeInstance;
  barkMap?: CanvasTexture;
  foliageMap?: CanvasTexture;
}) => {
  const groupRef = useRef<Group>(null);
  const foliageRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    const group = groupRef.current;
    const foliage = foliageRef.current;
    if (!group || !foliage) return;

    group.rotation.z = Math.sin(elapsed * 0.45 + instance.seed) * 0.012;
    foliage.rotation.x = Math.sin(elapsed * 0.9 + instance.seed) * 0.025;
    foliage.rotation.z = Math.cos(elapsed * 0.78 + instance.seed) * 0.03;
  });

  const isNeedleTree = instance.species === "fir" || instance.species === "cedar";
  const crownY = instance.trunkHeight * (isNeedleTree ? 0.46 : 0.88);

  return (
    <group
      ref={groupRef}
      position={instance.position}
      rotation={[0, instance.rotation, 0]}
      scale={instance.scale}
    >
      <Roots radius={instance.trunkRadius * 2.2} color={instance.barkColor} barkMap={barkMap} />
      <mesh castShadow receiveShadow position={[0, instance.trunkHeight / 2, 0]}>
        <cylinderGeometry
          args={[
            instance.trunkRadius * 0.72,
            instance.trunkRadius * 1.28,
            instance.trunkHeight,
            22,
            7,
          ]}
        />
        <meshStandardMaterial color={instance.barkColor} map={barkMap} roughness={1} metalness={0} />
      </mesh>
      {instance.species === "birch" && (
        <>
          {[1.3, 2.7, 4.1].map((height, index) => (
            <mesh key={index} castShadow receiveShadow position={[0, height, 0]} rotation={[0, index * 1.2, 0]}>
              <torusGeometry args={[instance.trunkRadius * 0.83, 0.018, 6, 18]} />
              <meshStandardMaterial color="#2d2822" roughness={1} />
            </mesh>
          ))}
        </>
      )}
      <group ref={foliageRef} position={[0, crownY, 0]}>
        <FoliageCluster
          color={instance.foliageColor}
          accent={instance.foliageAccent}
          radius={instance.crownRadius}
          species={instance.species}
          foliageMap={foliageMap}
        />
      </group>
    </group>
  );
};

const Trees = () => {
  const treeInstances = useMemo(createTreeInstances, []);
  const barkMap = useMemo(() => createTexture("#4b3326", "#8a6848", 4.3), []);
  const foliageMap = useMemo(() => createTexture("#1f3d27", "#4f6b38", 9.7), []);

  return (
    <group>
      {treeInstances.map((instance, index) => (
        <Tree key={index} instance={instance} barkMap={barkMap} foliageMap={foliageMap} />
      ))}
    </group>
  );
};

export default memo(Trees);
