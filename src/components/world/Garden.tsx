import { memo, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  ShaderMaterial,
  Vector3,
} from "three";
import {
  createRng,
  FIELD_HALF_SIZE,
  getPondInfo,
  getPondRadius,
  getPortfolioClearance,
  getTerrainHeight,
  getWaterDepthAt,
  POND_CENTER,
  randomSigned,
  WATER_LEVEL,
} from "../../helpers/forestTerrain";
import { useDispose } from "../../hooks/useDispose";

type GardenProps = {
  playerRef?: RefObject<RapierRigidBody | null>;
};

type DetailConfig = {
  position: [number, number, number];
  rotation: number;
  scale: number;
  variant: "rock" | "log" | "branch" | "moss" | "flower" | "reed";
  color: string;
  seed: number;
};

type FishConfig = {
  radiusX: number;
  radiusZ: number;
  speed: number;
  seed: number;
  phase: number;
  color: string;
};

const waterVertexShader = `
  uniform float uTime;
  varying vec2 vXZ;
  varying float vDepth;

  void main() {
    vXZ = position.xz;
    vDepth = color.r;
    vec3 transformed = position;
    float rippleA = sin((position.x * 0.42 + uTime * 1.7) + cos(position.z * 0.31)) * 0.025;
    float rippleB = sin((position.z * 0.53 - uTime * 1.2) + position.x * 0.12) * 0.018;
    transformed.y += rippleA + rippleB;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const waterFragmentShader = `
  uniform float uTime;
  varying vec2 vXZ;
  varying float vDepth;

  void main() {
    float ripple = sin(vXZ.x * 1.6 + uTime * 2.0) * sin(vXZ.y * 1.35 - uTime * 1.35);
    float foam = smoothstep(0.02, 0.18, vDepth) * (1.0 - smoothstep(0.45, 0.85, vDepth));
    vec3 shallow = vec3(0.36, 0.72, 0.74);
    vec3 deep = vec3(0.035, 0.12, 0.15);
    vec3 color = mix(shallow, deep, smoothstep(0.2, 1.0, vDepth));
    color += ripple * 0.035 + foam * vec3(0.09, 0.14, 0.12);
    gl_FragColor = vec4(color, 0.62);
  }
`;

const createPondWaterGeometry = () => {
  const segments = 120;
  const vertices: number[] = [POND_CENTER.x, WATER_LEVEL, POND_CENTER.y];
  const colors: number[] = [1, 1, 1];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const radius = getPondRadius(angle) * 0.985;
    const x = POND_CENTER.x + Math.cos(angle) * radius;
    const z = POND_CENTER.y + Math.sin(angle) * radius;
    const depth = Math.min(getWaterDepthAt(x, z) / 1.55, 1);

    vertices.push(x, WATER_LEVEL, z);
    colors.push(depth, depth, depth);
  }

  for (let i = 1; i <= segments; i += 1) {
    indices.push(0, i, i + 1);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

const Detail = ({ config }: { config: DetailConfig }) => {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || config.variant !== "reed") return;
    const wind = Math.sin(clock.elapsedTime * 1.8 + config.seed) * 0.08;
    group.rotation.z = wind;
  });

  if (config.variant === "rock") {
    return (
      <group ref={groupRef} position={config.position} rotation={[0, config.rotation, 0]} scale={config.scale}>
        <mesh castShadow receiveShadow scale={[1.4, 0.62, 1]}>
          <dodecahedronGeometry args={[0.72, 1]} />
          <meshStandardMaterial color={config.color} roughness={0.94} metalness={0.02} />
        </mesh>
      </group>
    );
  }

  if (config.variant === "log" || config.variant === "branch") {
    const isLog = config.variant === "log";
    return (
      <group ref={groupRef} position={config.position} rotation={[0.05, config.rotation, 1.48]} scale={config.scale}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[isLog ? 0.38 : 0.12, isLog ? 0.47 : 0.17, isLog ? 4.8 : 2.6, 18, 4]} />
          <meshStandardMaterial color={config.color} roughness={1} metalness={0} />
        </mesh>
        {isLog && (
          <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.44, 0.44, 0.08, 18]} />
            <meshStandardMaterial color="#6e5231" roughness={0.92} />
          </mesh>
        )}
      </group>
    );
  }

  if (config.variant === "moss") {
    return (
      <mesh position={config.position} rotation={[-Math.PI / 2, 0, config.rotation]} scale={config.scale} receiveShadow>
        <circleGeometry args={[1.1, 18]} />
        <meshStandardMaterial color={config.color} roughness={1} transparent opacity={0.76} />
      </mesh>
    );
  }

  if (config.variant === "reed") {
    return (
      <group ref={groupRef} position={config.position} rotation={[0, config.rotation, 0]} scale={config.scale}>
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.025, 0.045, 1.2, 6]} />
          <meshStandardMaterial color="#6d7b37" roughness={1} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 1.24, 0]}>
          <capsuleGeometry args={[0.07, 0.32, 4, 8]} />
          <meshStandardMaterial color="#7c5d32" roughness={0.95} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={config.position} rotation={[0, config.rotation, 0]} scale={config.scale}>
      <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.022, 0.035, 0.56, 6]} />
        <meshStandardMaterial color="#456a2e" roughness={1} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color={config.color} roughness={0.88} />
      </mesh>
    </group>
  );
};

const Fish = ({
  config,
  playerRef,
}: {
  config: FishConfig;
  playerRef?: RefObject<RapierRigidBody | null>;
}) => {
  const groupRef = useRef<Group>(null);
  const phaseRef = useRef(config.phase);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const elapsed = clock.getElapsedTime();
    const playerPos = playerRef?.current?.translation();
    const playerDistance = playerPos
      ? Math.hypot(playerPos.x - POND_CENTER.x, playerPos.z - POND_CENTER.y)
      : 999;
    const playerWake = Math.max(0, 1 - playerDistance / 17);

    phaseRef.current += delta * config.speed * (1 + playerWake * 1.5);

    const x =
      POND_CENTER.x +
      Math.cos(phaseRef.current + config.seed) * config.radiusX;
    const z =
      POND_CENTER.y +
      Math.sin(phaseRef.current * 1.18 + config.seed) * config.radiusZ;
    const floorY = getTerrainHeight(x, z);
    const y = Math.min(WATER_LEVEL - 0.32, floorY + 0.55 + Math.sin(elapsed * 5 + config.seed) * 0.05);

    group.position.set(x, y, z);
    group.rotation.y = -phaseRef.current + Math.PI / 2;
    group.rotation.z = Math.sin(elapsed * 8 + config.seed) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.07, 0.34, 5, 12]} />
        <meshStandardMaterial color={config.color} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.23, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.2, 8]} />
        <meshStandardMaterial color={config.color} roughness={0.72} />
      </mesh>
    </group>
  );
};

const FloatingParticles = () => {
  const points = useMemo(() => {
    const rng = createRng(81);
    return Array.from({ length: 85 }, () => {
      const x = randomSigned(rng) * FIELD_HALF_SIZE * 0.75;
      const z = randomSigned(rng) * FIELD_HALF_SIZE * 0.75;
      return new Vector3(x, getTerrainHeight(x, z) + 2.5 + rng() * 9, z);
    });
  }, []);

  return (
    <group>
      {points.map((point, index) => (
        <mesh key={index} position={point} scale={0.035 + (index % 5) * 0.008}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color="#f6e7bd" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

const PondWater = () => {
  const materialRef = useRef<ShaderMaterial>(null);
  const geometry = useMemo(createPondWaterGeometry, []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: waterVertexShader,
        fragmentShader: waterFragmentShader,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        vertexColors: true,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  useDispose([geometry, material]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <primitive ref={materialRef} object={material} attach="material" />
    </mesh>
  );
};

const Garden = ({ playerRef }: GardenProps) => {
  const details = useMemo<DetailConfig[]>(() => {
    const rng = createRng(1947);
    const items: DetailConfig[] = [];

    for (let i = 0; i < 185; i += 1) {
      const x = randomSigned(rng) * FIELD_HALF_SIZE * 0.92;
      const z = randomSigned(rng) * FIELD_HALF_SIZE * 0.92;
      const pond = getPondInfo(x, z);
      const portfolioClearance = getPortfolioClearance(x, z);
      const nearStart = Math.hypot(x, z) < 13;
      if (nearStart || portfolioClearance > 0.35 || (pond.inside && pond.basin > 0.42)) continue;

      const roll = rng();
      const variant =
        pond.bank > 0.35
          ? roll > 0.58
            ? "reed"
            : roll > 0.34
              ? "rock"
              : "branch"
          : roll > 0.82
            ? "log"
            : roll > 0.62
              ? "rock"
              : roll > 0.38
                ? "moss"
                : roll > 0.22
                  ? "flower"
                  : "branch";

      items.push({
        position: [x, getTerrainHeight(x, z) + 0.02, z],
        rotation: rng() * Math.PI * 2,
        scale: 0.55 + rng() * (variant === "log" ? 1.35 : 0.95),
        variant,
        color:
          variant === "rock"
            ? ["#4b5148", "#596057", "#3f463f"][Math.floor(rng() * 3)]
            : variant === "flower"
              ? ["#d8b66a", "#b5835a", "#cfd493", "#a78fb4"][Math.floor(rng() * 4)]
              : variant === "moss"
                ? "#435f30"
                : "#4b3322",
        seed: rng() * Math.PI * 2,
      });
    }

    for (let i = 0; i < 42; i += 1) {
      const angle = rng() * Math.PI * 2;
      const radius = getPondRadius(angle) * (0.84 + rng() * 0.27);
      const x = POND_CENTER.x + Math.cos(angle) * radius;
      const z = POND_CENTER.y + Math.sin(angle) * radius;
      items.push({
        position: [x, getTerrainHeight(x, z) + 0.03, z],
        rotation: angle,
        scale: 0.72 + rng() * 1.05,
        variant: rng() > 0.45 ? "reed" : "rock",
        color: rng() > 0.45 ? "#6b7437" : "#464b43",
        seed: rng() * Math.PI * 2,
      });
    }

    return items;
  }, []);

  const fish = useMemo<FishConfig[]>(
    () => [
      { radiusX: 6.8, radiusZ: 4.8, speed: 0.55, seed: 0.5, phase: 0.1, color: "#9b7b4a" },
      { radiusX: 8.2, radiusZ: 3.7, speed: 0.72, seed: 1.4, phase: 1.2, color: "#6f7960" },
      { radiusX: 4.6, radiusZ: 6.2, speed: 0.65, seed: 2.7, phase: 2.1, color: "#836f4f" },
      { radiusX: 7.3, radiusZ: 5.8, speed: 0.6, seed: 3.4, phase: 3.4, color: "#8c8a6d" },
    ],
    []
  );

  return (
    <group>
      <PondWater />
      {fish.map((config, index) => (
        <Fish key={index} config={config} playerRef={playerRef} />
      ))}
      {details.map((config, index) => (
        <Detail key={index} config={config} />
      ))}
      <FloatingParticles />
    </group>
  );
};

export default memo(Garden);
