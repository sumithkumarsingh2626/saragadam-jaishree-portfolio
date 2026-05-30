import React, { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import useDefaults from "./useDefaults";
import { getTerrainHeight } from "../helpers/forestTerrain";

interface CameraMovementProps {
  playerRef: React.RefObject<RapierRigidBody | null>;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const LOOK_SENSITIVITY = 0.00225;
const MIN_PITCH = -0.35;
const MAX_PITCH = 0.55;
const CAMERA_GROUND_CLEARANCE = 0.85;
const PLAYER_FOCUS_HEIGHT = 1.35;
const LOOK_AT_SMOOTHING = 18;
const lookState = {
  yaw: Math.PI,
  pitch: 0.16,
};

export const getThirdPersonLook = () => lookState;

const useCameraMovement = ({ playerRef }: CameraMovementProps) => {
  const {
    camera: { cameraDistance, cameraHeight, cameraSmoothing },
  } = useDefaults();
  const { camera, gl } = useThree();
  const targetPos = useRef(new Vector3());
  const focusPos = useRef(new Vector3());
  const lookAtPos = useRef(new Vector3());
  const forward = useRef(new Vector3());
  const dragActive = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragActive.current = true;
      canvas.style.cursor = "grabbing";
      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragActive.current) return;

      lookState.yaw -= event.movementX * LOOK_SENSITIVITY;
      lookState.pitch = clamp(
        lookState.pitch - event.movementY * LOOK_SENSITIVITY,
        MIN_PITCH,
        MAX_PITCH
      );
    };

    const handlePointerUp = () => {
      dragActive.current = false;
      canvas.style.cursor = "grab";
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [gl.domElement]);

  useFrame((_, delta) => {
    if (!playerRef.current) return;

    const playerPos = playerRef.current.translation();
    const clampedDelta = Math.min(delta, 0.033);
    const smoothing = 1 - Math.exp(-cameraSmoothing * clampedDelta);
    const lookSmoothing = 1 - Math.exp(-LOOK_AT_SMOOTHING * clampedDelta);

    forward.current.set(Math.sin(lookState.yaw), 0, -Math.cos(lookState.yaw));
    focusPos.current.set(playerPos.x, playerPos.y + PLAYER_FOCUS_HEIGHT, playerPos.z);
    if (lookAtPos.current.lengthSq() === 0) {
      lookAtPos.current.copy(focusPos.current);
    }
    lookAtPos.current.lerp(focusPos.current, lookSmoothing);
    targetPos.current
      .copy(focusPos.current)
      .addScaledVector(
        forward.current,
        -cameraDistance * Math.cos(lookState.pitch)
      );
    targetPos.current.y =
      focusPos.current.y + cameraHeight + Math.sin(lookState.pitch) * cameraDistance;
    targetPos.current.y = Math.max(
      targetPos.current.y,
      getTerrainHeight(targetPos.current.x, targetPos.current.z) + CAMERA_GROUND_CLEARANCE
    );

    camera.position.lerp(targetPos.current, smoothing);
    camera.position.y = Math.max(
      camera.position.y,
      getTerrainHeight(camera.position.x, camera.position.z) + CAMERA_GROUND_CLEARANCE
    );

    camera.lookAt(lookAtPos.current);
  });

  return null;
};

export default useCameraMovement;
