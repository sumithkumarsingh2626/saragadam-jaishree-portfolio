import { Html } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { PointLight } from "three";
import CollisionPlate from "../../base/CollisionPlate";
import { SPRITE_STYLES } from "../../constants/spriteStyles";

interface TrackProps {
  position: [number, number, number];
  started: boolean;
  failed: boolean;
  setStart: (started: boolean) => void;
}

const Track = ({ position, started, failed, setStart }: TrackProps) => {
  const [completed, setCompleted] = useState(false);
  const trackLightRef = useRef<PointLight>(null);

  useEffect(() => {
    if (completed) {
      setStart(false);
    }
  }, [completed, setStart]);

  useFrame(() => {
    if (trackLightRef.current) {
      trackLightRef.current.intensity = 0.12;
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 80]} />
        <meshStandardMaterial
          attach="material"
          color="#d7c789"
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh position={[-15.4, 0.22, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.38, 82]} />
        <meshStandardMaterial color="#8f8354" roughness={0.92} />
      </mesh>
      <mesh position={[15.4, 0.22, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.38, 82]} />
        <meshStandardMaterial color="#8f8354" roughness={0.92} />
      </mesh>
      {[-20, 0, 20].map((z) => (
        <mesh key={z} position={[0, 0.035, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[28, 0.36]} />
          <meshStandardMaterial color="#f2ead0" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.04, -39.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 1.2]} />
        <meshStandardMaterial color="#b64646" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.04, 39.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 1.2]} />
        <meshStandardMaterial color="#5f9b5f" roughness={0.85} />
      </mesh>
      <pointLight
        ref={trackLightRef}
        position={[0, 50, 5]}
        args={["#ffe0b8", 0.12, 95, 0.08]}
        castShadow={false}
      />
      <CollisionPlate
        name="gameStart"
        position={[0, 0.01, 40]}
        size={[30, 10]}
        color="#c2ba69"
        onCollision={({ type }) => {
          if (type === "enter") {
            setStart(true);
          }
        }}
      />
      <CollisionPlate
        name="gameEnd"
        position={[0, 0.01, -40]}
        size={[30, 10]}
        color="#c2ba69"
        onCollision={({ type }) => {
          if (type === "enter") {
            setCompleted(true);
            setTimeout(() => {
              setCompleted(false);
            }, 2000);
          }
        }}
      />

      {!started && !failed && (
        <Html sprite style={SPRITE_STYLES} position={[0, 5, 0]} transform>
          <div style={{ textAlign: "center" }}>
            <p>Start Game</p>
            <span>( Only move forward or backward</span>
            <br />
            <span>While the Doll is looking away )</span>
          </div>
        </Html>
      )}

      {completed && (
        <Html sprite style={SPRITE_STYLES} position={[0, 5, -50]} transform>
          <span>Congratulations!</span>
        </Html>
      )}

      {failed && (
        <Html sprite style={SPRITE_STYLES} position={[0, 5, 0]} transform>
          <span>Game Over! Try Again.</span>
        </Html>
      )}
    </group>
  );
};

export default Track;
