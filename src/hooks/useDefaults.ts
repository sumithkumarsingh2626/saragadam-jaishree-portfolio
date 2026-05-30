import { useControls } from "leva";

const useDefaults = () => {
  const physics = useControls("Physics", {
    debug: {
      label: "Debug",
      value: false,
    },
  });

  const effects = useControls("Effects", {
    enabled: {
      label: "Enabled",
      value: false,
    },
    bloomIntensity: {
      label: "Bloom Intensity",
      value: 1.5,
      step: 0.1,
      min: 0,
      max: 5,
    },
    bloomThreshold: {
      label: "Bloom Threshold",
      value: 0.6,
      step: 0.01,
      min: 0,
      max: 1,
    },
    bloomSmoothing: {
      label: "Bloom Smoothing",
      value: 0.7,
      step: 0.1,
      min: 0,
      max: 10,
    },
    bloomHeight: {
      label: "Bloom Height",
      value: 500,
      step: 10,
      min: 100,
      max: 1024,
    },
    mipmapBlur: {
      label: "Mipmap Blur",
      value: true,
    },
    radius: {
      label: "Blur Radius",
      value: 0.5,
      step: 0.1,
      min: 0,
      max: 2,
    },
  });

  const floor = useControls("Floor", {
    xWrap: {
      label: "xWrap",
      value: 200,
      step: 10,
      min: 0,
      max: 400,
    },
    yWrap: {
      label: "yWrap",
      value: 200,
      step: 10,
      min: 0,
      max: 400,
    },
  });

  const camera = useControls("Camera", {
    cameraDistance: {
      label: "Distance",
      value: 7.2,
      step: 0.25,
      min: 4.5,
      max: 14,
    },
    cameraHeight: {
      label: "Height",
      value: 1.25,
      step: 0.05,
      min: 0,
      max: 4,
    },
    lookAhead: {
      label: "Angle",
      value: -2,
      step: 0.5,
      min: -20,
      max: 20,
    },
    cameraSmoothing: {
      label: "Smoothing",
      value: 11,
      step: 0.5,
      min: 0,
      max: 20,
    },
  });

  const player = useControls("Player", {
    scale: {
      label: "Scale",
      value: 2,
      step: 0.1,
      min: 1,
      max: 5,
    },
    movementSpeed: {
      label: "Speed",
      value: 6.8,
      step: 0.5,
      min: 2,
      max: 15,
    },
    sprintMultiplier: {
      label: "Sprint Multiplier",
      value: 1.55,
      step: 0.1,
      min: 1,
      max: 3,
    },
  });

  return { physics, floor, camera, player, effects };
};

export default useDefaults;
