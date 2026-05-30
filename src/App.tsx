import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import {
  KeyboardControls,
  PerformanceMonitor,
  Stats,
} from "@react-three/drei";
import { useLocation } from "react-router-dom";
import { Leva } from "leva";
import { ACESFilmicToneMapping, PCFSoftShadowMap } from "three";
import { KEYBOARD_MAP } from "./hooks/useMovementState";
import useDefaults from "./hooks/useDefaults";
import World from "./components/world/World";
import "./App.css";

const TARGET_INTERVAL = 1000 / 60;

// Hard 60fps cap: frameloop="never" means R3F won't render on its own.
// We drive it manually with RAF + timestamp delta check so the cap is exact.
const FpsLimiter = () => {
  const { advance } = useThree();
  const lastTime = useRef(0);

  useEffect(() => {
    let rafId: number;
    const loop = (time: number) => {
      rafId = requestAnimationFrame(loop);
      const delta = time - lastTime.current;
      if (delta >= TARGET_INTERVAL) {
        lastTime.current = time - (delta % TARGET_INTERVAL);
        advance(time / 1000);
      }
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [advance]);

  return null;
};

const CinematicIntro = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 5400);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="cinematic-intro" aria-hidden="true">
      <div className="intro-vignette" />
      <div className="intro-title">
        <span>Welcome To My Page</span>
      </div>
      <div className="door-stage">
        <div className="door-panel door-left">
          <div className="door-grain" />
          <div className="door-handle" />
        </div>
        <div className="door-panel door-right">
          <div className="door-grain" />
          <div className="door-handle" />
        </div>
      </div>
      <div className="intro-landing" />
    </div>
  );
};

const App = () => {
  const {
    physics: { debug },
  } = useDefaults();
  const { hash } = useLocation();
  const [dpr, setDpr] = useState(() =>
    Math.min(window.devicePixelRatio || 1, 2)
  );

  const isDebugMode = hash === "#debug";

  return (
    <>
      <div id="cover">
        <CinematicIntro />
        <KeyboardControls map={KEYBOARD_MAP}>
          <Canvas
            dpr={dpr}
            style={{
              height: "100vh",
              width: "100vw",
            }}
            camera={{ fov: 64, near: 0.05, far: 1000, position: [0, 1.7, 4] }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              toneMapping: ACESFilmicToneMapping,
              toneMappingExposure: 0.98,
            }}
            shadows={{ type: PCFSoftShadowMap }}
            frameloop="never"
            id="canvas"
          >
            <FpsLimiter />
            <PerformanceMonitor
              onIncline={() =>
                setDpr(Math.min(window.devicePixelRatio || 1, 2.5))
              }
              onDecline={() => setDpr(Math.min(window.devicePixelRatio || 1, 1.25))}
              bounds={() => [45, 90]}
            >
              {isDebugMode && <Stats />}
              <Suspense fallback={null}>
                <Physics debug={isDebugMode && debug} timeStep="vary">
                  <World />
                </Physics>
              </Suspense>
            </PerformanceMonitor>
          </Canvas>
        </KeyboardControls>
      </div>
      <Leva hidden={!isDebugMode} />
    </>
  );
};

export default App;
