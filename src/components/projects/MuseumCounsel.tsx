import React from "react";
import { useGLTF } from "@react-three/drei";
import Project from "../../base/Project";
import PlateScreen from "../../base/Screen";

const MuseumCounsel = () => {
  const [mcModel, mcLeft, mcRight] = useGLTF(
    ["/models/mc.glb", "/models/mc1.glb", "/models/mc3.glb"],
    true
  );

  return (
    <Project
      ScreenComponent={MCScreen}
      position={[-60, 0, -140]}
      title="Disaster Response Dashboard"
      rotation={[0, -Math.PI / 2, 0]}
      model={mcModel}
      modelLeft={mcLeft}
      modelRight={mcRight}
      scale={1}
    />
  );
};

export default MuseumCounsel;

const MCScreen: React.FC = () => (
  <PlateScreen
    title="Disaster Response Dashboard"
    description="A web-based coordination dashboard for monitoring disaster incidents, active cases, available resources, and volunteer participation during critical situations."
    visitLink="https://github.com/jaishreee978?tab=repositories"
  />
);
