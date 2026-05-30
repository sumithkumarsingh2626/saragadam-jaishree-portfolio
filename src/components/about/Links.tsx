import React, { memo } from "react";
import Text from "../../base/Text";
import Link from "../../base/Link";

const Links: React.FC = () => {
  const z = 100;
  const x = -10;
  const z_sub = 12;

  return (
    <group>
      <Text
        scale={4}
        rotation={[-Math.PI / 8, Math.PI * 2, 0]}
        position={[x - 1.5, 2.1, z - 45]}
      >
        Links
      </Text>
      <group position={[x, 1, z + 15]} rotation={[0, Math.PI * 2, 0]}>
        <Link position={[0, 0, 0]} to="mailto:saragadamjaishree@gmail.com">
          Email
        </Link>
        <Link
          position={[0, 0, -z_sub]}
          to="https://github.com/jaishreee978"
        >
          GitHub
        </Link>
      </group>
    </group>
  );
};

export default memo(Links);
