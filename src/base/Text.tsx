import React, { useMemo, useRef } from "react";
import { ThreeElements, useFrame } from "@react-three/fiber";
import {
  Text,
  Text3D,
  Text3DProps,
  TextProps,
  useFont,
} from "@react-three/drei";
import { DoubleSide, Group, Vector3 } from "three";

type BaseTextProps = ThreeElements["group"] & {
  type?: "2d" | "3d";
  textOptions?: Text3DProps | TextProps;
  opacity?: number;
  floatStrength?: number;
  floatSpeed?: number;
};

const BaseText: React.FC<BaseTextProps> = ({
  type = "2d",
  children,
  position,
  rotation = [0, 0, 0],
  textOptions = { size: 1, height: 0.1, font: "/fonts/Roboto_Regular.json" },
  opacity = 0.7,
  floatStrength = 0.08,
  floatSpeed = 0.85,
  ...props
}) => {
  const groupRef = useRef<Group>(null);
  const baseY = useMemo(() => {
    if (Array.isArray(position)) return position[1] ?? 0;
    if (position instanceof Vector3) return position.y;
    return 0;
  }, [position]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      baseY + Math.sin(clock.getElapsedTime() * floatSpeed) * floatStrength;
  });

  if (type === "3d") {
    return (
      <group ref={groupRef} position={position} rotation={rotation} {...props}>
        <Text3D {...(textOptions as Text3DProps)}>
          {children}
          <meshBasicMaterial
            attach="material"
            color="#fff3c4"
            side={DoubleSide}
            transparent
            opacity={Math.max(opacity, 0.92)}
          />
        </Text3D>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} rotation={rotation} {...props}>
      <Text
        anchorX="left"
        anchorY="middle"
        color="#fff3c4"
        fillOpacity={Math.max(opacity, 0.94)}
        outlineWidth={0.035}
        outlineColor="#121a22"
        outlineOpacity={0.95}
        strokeWidth={0.012}
        strokeColor="#121a22"
        strokeOpacity={0.85}
        rotation={[0, 0, 0]}
      >
        {children}
      </Text>
    </group>
  );
};

useFont.preload("/fonts/Roboto_Regular.json");

export default BaseText;
