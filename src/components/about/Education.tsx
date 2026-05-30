import React, { memo } from "react";
import Text from "../../base/Text";

const Education: React.FC = () => {
  return (
    <group position={[20, 0.1, 70]}>
      <Text
        scale={4}
        position={[-7, 2.1, -14.5]}
        rotation={[-Math.PI / 8, Math.PI * 2, 0]}
      >
        Education
      </Text>
      <group rotation={[0, Math.PI, 0]} position={[-1, 1.1, -2]}>
        <Text rotation={[Math.PI / 4, Math.PI, 0]}>
          Baba Institute of Tech. & Sciences
        </Text>
        <Text rotation={[Math.PI / 4, Math.PI, 0]} position={[1, 0, -5]}>
          B.Tech CSE
        </Text>
        <Text rotation={[Math.PI / 4, Math.PI, 0]} position={[1, 0, -10]}>
          Aug 2024 - Present
        </Text>
      </group>
      <group rotation={[0, Math.PI, 0]} position={[-2, 1.1, 18]}>
        <Text rotation={[Math.PI / 4, Math.PI, 0]} position={[4, 0, 0]}>
          Sri Chaitanya Jr. College
        </Text>
        <Text rotation={[Math.PI / 4, Math.PI, 0]} position={[1, 0, -5]}>
          Intermediate (MPC)
        </Text>
        <Text rotation={[Math.PI / 4, Math.PI, 0]} position={[1, 0, -10]}>
          Jul 2022 - Mar 2024
        </Text>
      </group>
      <group rotation={[0, Math.PI, 0]} position={[-2, 1.1, 38]}>
        <Text rotation={[Math.PI / 4, Math.PI, 0]} position={[4, 0, 0]}>
          GVMC High School
        </Text>
        <Text rotation={[Math.PI / 4, Math.PI, 0]} position={[1, 0, -5]}>
          SSC
        </Text>
        <Text rotation={[Math.PI / 4, Math.PI, 0]} position={[1, 0, -10]}>
          Jul 2014 - Apr 2022
        </Text>
      </group>
    </group>
  );
};

export default memo(Education);
