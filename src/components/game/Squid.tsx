import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Mesh, Texture } from "three";
import { useThree } from "@react-three/fiber";
import { forwardRef } from "react";

const Squid = forwardRef((_, squidRef) => {
  const { gl } = useThree();
  const squid = useGLTF("/models/squid/scene.gltf", true);

  useEffect(() => {
    squid.scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const material = child.material as { map?: Texture };
        if (material.map) {
          material.map.anisotropy = gl.capabilities.getMaxAnisotropy();
          material.map.needsUpdate = true;
        }
      }
    });
  }, [gl, squid.scene]);

  return (
    <primitive ref={squidRef} object={squid.scene} rotation={[0, Math.PI, 0]} />
  );
});

Squid.displayName = "Squid";

export default Squid;
