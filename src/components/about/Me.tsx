import React, { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import Text from "../../base/Text";

const Me: React.FC = () => {
  const secondRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (secondRef.current) {
      secondRef.current.position.y = 14 + Math.sin(elapsedTime * 0.6) * 0.18;
      secondRef.current.rotation.z = Math.sin(elapsedTime * 0.5) * 0.04;
    }
  });

  return (
    <group ref={secondRef} position={[72, 14, 90]} rotation={[0, 0, 0]}>
      <Text
        type="3d"
        position={[0, 2.8, 0]}
        textOptions={{
          size: 5.6,
          height: 1.5,
          font: "/fonts/Roboto_Regular.json",
        }}
      >
        SARAGADAM
      </Text>
      <Text
        type="3d"
        position={[0, -3.2, 0]}
        textOptions={{
          size: 5.6,
          height: 1.5,
          font: "/fonts/Roboto_Regular.json",
        }}
      >
        JAISHREE
      </Text>
    </group>
  );
};

export default Me;
