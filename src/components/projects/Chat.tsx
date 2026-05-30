import React from "react";
import { useGLTF } from "@react-three/drei";
import Project from "../../base/Project";
import PlateScreen from "../../base/Screen";

const Chat = () => {
  const chatModel = useGLTF("/models/chat.glb", true);

  return (
    <Project
      ScreenComponent={ChatScreen}
      position={[-120, 0, -70]}
      rotation={[0, -Math.PI / 2, 0]}
      title="GitHub Profile"
      model={chatModel}
      scale={[2, 1.8, 2]}
    />
  );
};

export default Chat;

const ChatScreen: React.FC = () => (
  <PlateScreen
    title="GitHub Profile"
    description="Explore the repository collection, ongoing experiments, and newer work on GitHub."
    visitLink="https://github.com/jaishreee978"
  />
);
