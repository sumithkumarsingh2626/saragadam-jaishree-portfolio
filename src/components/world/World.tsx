import React, { lazy, Suspense, useRef } from "react";
import { Preload } from "@react-three/drei";
import { RapierRigidBody } from "@react-three/rapier";
import Paths from "./Paths";
import Player from "./Player";
import Trees from "./Trees";
import Floor from "./Floor";
import Light from "./Light";
import Portal from "../portal/Portal";
import Grass from "./Grass";
import CinematicEffects from "./CinematicEffects";
import Garden from "./Garden";

const Game = lazy(() => import("../game/Game"));
const Projects = lazy(() => import("../projects/Projects"));
const Lamps = lazy(() => import("../lamps/Lamps"));
const Skills = lazy(() => import("../skills/Skills"));
const About = lazy(() => import("../about/About"));

const World: React.FC = () => {
  const playerRef = useRef<RapierRigidBody | null>(null);

  return (
    <>
      {/* Base */}
      <Player playerRef={playerRef} />
      <Floor />
      <Grass />
      <Garden playerRef={playerRef} />
      <Trees />
      <Light />

      {/* Portfolio content restored inside the forest environment. */}
      <Paths />
      <Portal />
      <Suspense fallback={null}>
        <Lamps />
        <Skills />
        <About />
        <Game />
        <Projects />
        <Preload all />
      </Suspense>
      <CinematicEffects />
    </>
  );
};

export default World;
