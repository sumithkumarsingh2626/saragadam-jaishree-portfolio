import React, { useMemo } from "react";
import {
  BufferAttribute,
  Color,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { RigidBody } from "@react-three/rapier";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  FIELD_SIZE,
  getPondInfo,
  getTerrainColor,
  getTerrainHeight,
} from "../../helpers/forestTerrain";
import { useDispose } from "../../hooks/useDispose";

const SEGMENTS = 190;

const Floor: React.FC = () => {
  const { gl } = useThree();
  const terrainTexture = useTexture("/assets/grass.jpg", (texture) => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(54, 54);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
  });

  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(FIELD_SIZE, FIELD_SIZE, SEGMENTS, SEGMENTS);
    const position = plane.attributes.position;
    const colors: number[] = [];
    const color = new Color();

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const z = -position.getY(i);
      const height = getTerrainHeight(x, z);
      const pond = getPondInfo(x, z);

      position.setZ(i, height);
      color.copy(getTerrainColor(x, z));

      if (pond.shore < 3.5) {
        color.offsetHSL(0, -0.06, -0.08);
      }

      colors.push(color.r, color.g, color.b);
    }

    plane.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));
    plane.computeVertexNormals();
    return plane;
  }, []);

  useDispose([geometry, terrainTexture]);

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={geometry}>
        <meshStandardMaterial
          map={terrainTexture}
          vertexColors
          roughness={0.96}
          metalness={0}
        />
      </mesh>
    </RigidBody>
  );
};

export default Floor;
