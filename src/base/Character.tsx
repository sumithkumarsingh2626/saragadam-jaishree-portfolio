import { forwardRef, useEffect, useRef, RefObject } from "react";
import {
  AnimationAction,
  BufferGeometry,
  Color,
  Group,
  Material,
  Object3D,
  SkinnedMesh,
  Texture,
} from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import { ThreeElements, useFrame, useThree } from "@react-three/fiber";

type GLTFResult = Object3D & {
  geometry: BufferGeometry;
  material: Material;
  skeleton: SkinnedMesh["skeleton"];
};

type EmissiveMaterial = Material & {
  color?: Color;
  emissive?: { copy: (color: Color) => void };
  emissiveIntensity?: number;
  map?: Texture | null;
  needsUpdate?: boolean;
};

export type CharacterAnimationType = "Idle" | "Walk" | "Run";

type CharacterProps = ThreeElements["group"] & {
  animation?: CharacterAnimationType;
};

const CHARACTER_PALETTE: Record<string, string> = {
  Skin: "#c88f72",
  UnderShirt: "#9fc9e6",
  Pants: "#17243d",
  Shirt: "#263955",
  Detail: "#7fb0d1",
  Boots: "#08090c",
  "Material.006": "#101010",
};

const HAIR = "#101010";
const BACKPACK = "#111822";
const GLASSES = "#101318";
const BUCKLE = "#c2a05f";

const StudentDetails = ({ animation }: { animation: CharacterAnimationType }) => {
  const ponytailRef = useRef<Group>(null);
  const backpackRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const moving = animation !== "Idle";
    const run = animation === "Run";
    const stride = moving ? Math.sin(elapsed * (run ? 12.2 : 7.4)) : 0;
    const bounce = moving ? Math.abs(stride) * (run ? 0.07 : 0.03) : 0;

    if (ponytailRef.current) {
      ponytailRef.current.rotation.x = -0.34 + stride * (run ? 0.14 : 0.07);
      ponytailRef.current.rotation.z = stride * 0.04;
    }
    if (backpackRef.current) {
      backpackRef.current.position.y = 0.99 + bounce;
      backpackRef.current.rotation.x = -0.08 + stride * 0.025;
    }
  });

  return (
    <group>
      <group position={[0, 1.48, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.22, -0.02]} scale={[0.32, 0.17, 0.28]}>
          <sphereGeometry args={[1, 32, 14]} />
          <meshStandardMaterial color={HAIR} roughness={0.92} />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.14, 0.08, 0.17]} rotation={[0.18, 0, 0.42]} scale={[0.065, 0.28, 0.05]}>
          <capsuleGeometry args={[0.38, 0.34, 8, 14]} />
          <meshStandardMaterial color={HAIR} roughness={0.96} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.14, 0.08, 0.17]} rotation={[0.18, 0, -0.42]} scale={[0.065, 0.28, 0.05]}>
          <capsuleGeometry args={[0.38, 0.34, 8, 14]} />
          <meshStandardMaterial color={HAIR} roughness={0.96} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.11, 0.18]} scale={[0.18, 0.08, 0.045]}>
          <sphereGeometry args={[1, 18, 10]} />
          <meshStandardMaterial color={HAIR} roughness={0.96} />
        </mesh>
        <group ref={ponytailRef} position={[0, 0.21, -0.28]}>
          <mesh castShadow receiveShadow position={[0, 0.05, 0]} scale={[0.11, 0.11, 0.11]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color={HAIR} roughness={0.94} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.2, -0.08]} rotation={[0.16, 0, 0]} scale={[0.1, 0.4, 0.1]}>
            <capsuleGeometry args={[0.42, 0.52, 10, 18]} />
            <meshStandardMaterial color={HAIR} roughness={0.98} />
          </mesh>
        </group>
        <group position={[0, 0.05, 0.295]}>
          <mesh position={[-0.105, 0, 0.003]}>
            <circleGeometry args={[0.07, 28]} />
            <meshPhysicalMaterial
              color="#cfe7f1"
              transparent
              opacity={0.18}
              roughness={0.05}
              metalness={0}
              transmission={0.55}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0.105, 0, 0.003]}>
            <circleGeometry args={[0.07, 28]} />
            <meshPhysicalMaterial
              color="#cfe7f1"
              transparent
              opacity={0.18}
              roughness={0.05}
              metalness={0}
              transmission={0.55}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[-0.105, 0, 0]} scale={[1.08, 0.76, 1]}>
            <torusGeometry args={[0.082, 0.011, 10, 36]} />
            <meshStandardMaterial color={GLASSES} roughness={0.32} metalness={0.55} />
          </mesh>
          <mesh position={[0.105, 0, 0]} scale={[1.08, 0.76, 1]}>
            <torusGeometry args={[0.082, 0.011, 10, 36]} />
            <meshStandardMaterial color={GLASSES} roughness={0.32} metalness={0.55} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.007, 0.007, 0.09, 10]} />
            <meshStandardMaterial color={GLASSES} roughness={0.32} metalness={0.55} />
          </mesh>
          <mesh position={[-0.185, 0.01, -0.11]} rotation={[Math.PI / 2, 0.18, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.24, 10]} />
            <meshStandardMaterial color={GLASSES} roughness={0.32} metalness={0.55} />
          </mesh>
          <mesh position={[0.185, 0.01, -0.11]} rotation={[Math.PI / 2, -0.18, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.24, 10]} />
            <meshStandardMaterial color={GLASSES} roughness={0.32} metalness={0.55} />
          </mesh>
        </group>
      </group>

      <group ref={backpackRef} position={[0, 0.99, -0.33]}>
        <mesh castShadow receiveShadow scale={[0.34, 0.5, 0.15]}>
          <capsuleGeometry args={[0.72, 0.5, 10, 22]} />
          <meshStandardMaterial color={BACKPACK} roughness={0.88} metalness={0.03} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.13, -0.12]} scale={[0.2, 0.16, 0.035]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#1d2b3c" roughness={0.8} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, -0.06, 0.13]} scale={[0.035, 0.035, 0.012]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color={BUCKLE} roughness={0.42} metalness={0.25} />
        </mesh>
      </group>
    </group>
  );
};

const Character = forwardRef<Group, CharacterProps>(function Character(
  { animation = "Idle", ...props },
  forwardedRef
) {
  const { gl } = useThree();
  const internalRef = useRef<Group>(null);
  const group = (forwardedRef ?? internalRef) as RefObject<Group>;
  const { nodes, materials, animations } = useGLTF("/models/player.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    Object.entries(materials).forEach(([name, material]: [string, EmissiveMaterial]) => {
      const paletteColor = CHARACTER_PALETTE[name];
      if (paletteColor && material.color) {
        material.color.set(paletteColor);
      }
      if (name === "Material.006") {
        material.map = null;
        material.needsUpdate = true;
      }
      if (material.emissive && material.color) {
        material.emissive.copy(material.color);
        material.emissiveIntensity = name === "Material.006" ? 0.08 : 0.3;
      }
      const typedMaterial = material as EmissiveMaterial;
      if (typedMaterial.map) {
        typedMaterial.map.anisotropy = gl.capabilities.getMaxAnisotropy();
        typedMaterial.map.needsUpdate = true;
      }
    });
  }, [gl, materials]);

  useEffect(() => {
    if (!actions) return;

    const action = actions[animation];
    const currentAction = Object.values(actions).find(
      (a): a is AnimationAction => !!(a && a.isRunning())
    );

    if (currentAction?.getClip().name === action?.getClip().name) return;

    if (
      currentAction &&
      currentAction?.getClip().name !== action?.getClip().name
    ) {
      currentAction.fadeOut(0.3);
    }

    action?.reset().fadeIn(0.3).play();
  }, [animation, actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <StudentDetails animation={animation} />
      <group name="Root_Scene">
        <group name="RootNode">
          <group
            name="CharacterArmature"
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <primitive object={nodes.Root} />
          </group>
          <group
            name="Rogue"
            position={[0, 0, 0.166]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <skinnedMesh
              name="Rogue_1"
              geometry={(nodes.Rogue_1 as GLTFResult).geometry}
              material={materials.Skin}
              skeleton={(nodes.Rogue_1 as GLTFResult).skeleton}
              castShadow
              receiveShadow
            />
            <skinnedMesh
              name="Rogue_2"
              geometry={(nodes.Rogue_2 as GLTFResult).geometry}
              material={materials.UnderShirt}
              skeleton={(nodes.Rogue_2 as GLTFResult).skeleton}
              castShadow
              receiveShadow
            />
            <skinnedMesh
              name="Rogue_3"
              geometry={(nodes.Rogue_3 as GLTFResult).geometry}
              material={materials.Pants}
              skeleton={(nodes.Rogue_3 as GLTFResult).skeleton}
              castShadow
              receiveShadow
            />
            <skinnedMesh
              name="Rogue_4"
              geometry={(nodes.Rogue_4 as GLTFResult).geometry}
              material={materials.Shirt}
              skeleton={(nodes.Rogue_4 as GLTFResult).skeleton}
              castShadow
              receiveShadow
            />
            <skinnedMesh
              name="Rogue_5"
              geometry={(nodes.Rogue_5 as GLTFResult).geometry}
              material={materials.Detail}
              skeleton={(nodes.Rogue_5 as GLTFResult).skeleton}
              castShadow
              receiveShadow
            />
            <skinnedMesh
              name="Rogue_6"
              geometry={(nodes.Rogue_6 as GLTFResult).geometry}
              material={materials.Boots}
              skeleton={(nodes.Rogue_6 as GLTFResult).skeleton}
              castShadow
              receiveShadow
            />
          </group>
          <skinnedMesh
            name="Rogue001"
            geometry={(nodes.Rogue001 as GLTFResult).geometry}
            material={materials["Material.006"]}
            skeleton={(nodes.Rogue001 as GLTFResult).skeleton}
            position={[0, 0, 0.166]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
            visible={false}
            castShadow
            receiveShadow
          />
        </group>
      </group>
    </group>
  );
});

useGLTF.preload("/models/player.glb");

export default Character;
