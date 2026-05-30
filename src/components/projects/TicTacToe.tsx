import React from "react";
import { useGLTF } from "@react-three/drei";
import Project from "../../base/Project";
import PlateScreen from "../../base/Screen";

const TicTacToe = () => {
  const [tttModel, tttLeft] = useGLTF(
    ["/models/ttt.glb", "/models/ttt1.glb"],
    true
  );

  return (
    <Project
      ScreenComponent={TTTScreen}
      position={[-120, 0, -140]}
      rotation={[0, -Math.PI / 2, 0]}
      title="More Projects"
      model={tttModel}
      modelLeft={tttLeft}
      scale={[1.2, 1.2, 1]}
      subScale={0.8}
    />
  );
};

export default TicTacToe;

const TTTScreen: React.FC = () => (
  <PlateScreen
    title="More Projects"
    description="Additional projects are actively in progress and available through the GitHub repositories."
    visitLink="https://github.com/jaishreee978?tab=repositories"
  />
);
