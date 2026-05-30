import React, { useRef } from "react";
import { Group, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import useCameraMovement, { getThirdPersonLook } from "./useCameraMovement";
import useMovementState, { KeyControls } from "./useMovementState";
import useDefaults from "./useDefaults";
import { getTerrainHeight, getWaterDepthAt } from "../helpers/forestTerrain";

const ACCELERATION = 22;
const FRICTION = 0.62;
const ROTATION_SPEED = 12;
const PLAYER_ROOT_HEIGHT = 1.75;

interface UsePlayerMovementProps {
  playerRef: React.RefObject<RapierRigidBody | null>;
  characterRef: React.RefObject<Group | null>;
}

// Pre-allocated vectors to avoid per-frame GC pressure
const _direction = new Vector3();
const _forward = new Vector3();
const _right = new Vector3();
const _targetVelocity = new Vector3();
const _linvel = new Vector3();
const _translation = new Vector3();

const usePlayerMovement = ({ playerRef, characterRef }: UsePlayerMovementProps) => {
  useCameraMovement({ playerRef });
  const {
    player: { movementSpeed, sprintMultiplier },
  } = useDefaults();

  const forwardPressed = useMovementState(KeyControls.forward);
  const backPressed = useMovementState(KeyControls.back);
  const leftPressed = useMovementState(KeyControls.left);
  const rightPressed = useMovementState(KeyControls.right);
  const sprintPressed = useMovementState(KeyControls.sprint);

  const targetRotationRef = useRef(0);
  const currentRotationRef = useRef(0);

  useFrame((_, delta) => {
    if (!playerRef.current) return;

    const rb = playerRef.current;
    const currentVel = rb.linvel();
    const pos = rb.translation();
    const { yaw } = getThirdPersonLook();

    const clampedDelta = Math.min(delta, 0.033);
    const inputX = Number(rightPressed) - Number(leftPressed);
    const inputZ = Number(forwardPressed) - Number(backPressed);

    _forward.set(Math.sin(yaw), 0, -Math.cos(yaw));
    _right.set(Math.cos(yaw), 0, Math.sin(yaw));

    _direction.set(0, 0, 0);

    const waterDepth = getWaterDepthAt(pos.x, pos.z);
    const waterDrag = waterDepth > 0 ? 1 - Math.min(waterDepth / 1.5, 0.52) : 1;
    const moveSpeed = (sprintPressed
      ? movementSpeed * sprintMultiplier
      : movementSpeed) * waterDrag;

    _direction
      .addScaledVector(_forward, inputZ)
      .addScaledVector(_right, inputX);

    if (_direction.length() > 0) {
      _direction.normalize().multiplyScalar(moveSpeed);
    }

    const lerpFactor = 1 - Math.exp(-ACCELERATION * clampedDelta);
    _targetVelocity.copy(_direction);
    _linvel.x = currentVel.x + (_targetVelocity.x - currentVel.x) * lerpFactor;
    _linvel.z = currentVel.z + (_targetVelocity.z - currentVel.z) * lerpFactor;

    if (_direction.x === 0) _linvel.x *= Math.pow(FRICTION, clampedDelta);
    if (_direction.z === 0) _linvel.z *= Math.pow(FRICTION, clampedDelta);

    const targetY = getTerrainHeight(pos.x, pos.z) + PLAYER_ROOT_HEIGHT;
    _translation.set(pos.x, targetY, pos.z);
    rb.setTranslation(_translation, true);

    _linvel.y = 0;
    rb.setLinvel(_linvel, true);

    if (_direction.length() > 0) {
      targetRotationRef.current = Math.atan2(_direction.x, _direction.z);
    }

    const angleDiff = targetRotationRef.current - currentRotationRef.current;
    const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    currentRotationRef.current += normalizedDiff * ROTATION_SPEED * clampedDelta;

    // Mutate rotation directly to avoid React state churn.
    if (characterRef.current) {
      characterRef.current.rotation.y = currentRotationRef.current;
    }
  });
};

export default usePlayerMovement;
