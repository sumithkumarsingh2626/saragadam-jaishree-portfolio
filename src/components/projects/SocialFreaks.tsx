import React from "react";
import { useGLTF } from "@react-three/drei";
import Project from "../../base/Project";
import PlateScreen from "../../base/Screen";

const SocialFreaks = () => {
  const [sfModel, mfModel, fsModel] = useGLTF(
    ["/models/sf.glb", "/models/mf.glb", "/models/fs.glb"],
    true
  );

  return (
    <Project
      ScreenComponent={SFScreen}
      position={[-120, 0, -10]}
      rotation={[0, -Math.PI / 2, 0]}
      title="Smart GPA Analyzer"
      model={sfModel}
      modelLeft={mfModel}
      modelRight={fsModel}
      scale={3}
    />
  );
};

export default SocialFreaks;

const SFScreen: React.FC = () => (
  <PlateScreen
    title="Smart GPA Analyzer"
    description="A modern web application for calculating GPA using credit-based grading, tracking semester performance, and analyzing academic progress through a clean dashboard."
    visitLink="https://github.com/jaishreee978?tab=repositories"
  />
);
