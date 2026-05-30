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
import { ThreeElements, useThree } from "@react-three/fiber";

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
