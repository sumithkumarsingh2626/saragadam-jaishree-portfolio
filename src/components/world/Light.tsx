import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Cloud, Sky } from "@react-three/drei";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
} from "three";

const Light: React.FC = () => {
  const ambientRef = useRef<AmbientLight>(null);
  const hemisphereRef = useRef<HemisphereLight>(null);
  const sunRef = useRef<DirectionalLight>(null);
  const { scene } = useThree();

  const daySky = useMemo(() => new Color("#a3c4d8"), []);
  const dayGround = useMemo(() => new Color("#1f231b"), []);

  useEffect(() => {
    scene.background = daySky.clone();
    scene.fog = new Fog("#9fb8ad", 55, 280);
    return () => {
      scene.fog = null;
    };
  }, [daySky, scene]);

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[18, 28, 12]}
        inclination={0.48}
        azimuth={0.18}
        turbidity={7}
        rayleigh={1.8}
        mieCoefficient={0.014}
        mieDirectionalG={0.78}
      />
      <Cloud
        position={[-40, 54, -70]}
        opacity={0.18}
        speed={0.08}
        bounds={[48, 9, 18]}
        volume={18}
        segments={24}
      />
      <Cloud
        position={[80, 58, 45]}
        opacity={0.14}
        speed={0.05}
        bounds={[56, 8, 16]}
        volume={20}
        segments={24}
      />
      <ambientLight ref={ambientRef} color="#dce9df" intensity={0.26} />
      <hemisphereLight
        ref={hemisphereRef}
        color="#9ecbff"
        groundColor={dayGround}
        intensity={0.44}
        position={[0, 30, 0]}
      />
      <directionalLight
        ref={sunRef}
        color="#fff0c4"
        intensity={2.05}
        position={[18, 28, 12]}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-camera-left={-135}
        shadow-camera-right={135}
        shadow-camera-top={135}
        shadow-camera-bottom={-135}
        shadow-bias={-0.00022}
        shadow-normalBias={0.055}
      />
    </>
  );
};

export default Light;
