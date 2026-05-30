import React from "react";
import { useGLTF } from "@react-three/drei";
import Project from "../../base/Project";
import PlateScreen from "../../base/Screen";

const InnovationCounsel = () => {
  const [iicModel, eventsModel, loginModel] = useGLTF(
    ["/models/iic.glb", "/models/iicEvents.glb", "/models/iicLogin.glb"],
    true
  );

  return (
    <Project
      ScreenComponent={ICScreen}
      position={[-60, 0, -40]}
      title="Smart Campus ERP"
      rotation={[0, -Math.PI / 2, 0]}
      model={iicModel}
      modelRight={eventsModel}
      modelLeft={loginModel}
    />
  );
};

export default InnovationCounsel;

const ICScreen: React.FC = () => (
  <PlateScreen
    title="Smart Campus ERP"
    description="A campus management platform with an integrated complaint module that helps students and staff raise, track, and resolve institutional issues efficiently."
    visitLink="https://github.com/jaishreee978?tab=repositories"
  />
);
