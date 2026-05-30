import React from "react";
import {
  EffectComposer,
  N8AO,
  Noise,
  Vignette,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

const CinematicEffects: React.FC = () => {
  return (
    <EffectComposer multisampling={4}>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} exposure={0.88} />
      <N8AO aoRadius={5.6} intensity={1.35} distanceFalloff={0.72} />
      <Noise opacity={0.006} />
      <Vignette eskil={false} offset={0.28} darkness={0.72} />
    </EffectComposer>
  );
};

export default CinematicEffects;
