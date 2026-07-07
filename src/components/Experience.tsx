import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, CameraControls, ContactShadows, Center } from "@react-three/drei";
import * as THREE from "three";
import { Ferrari } from "./Ferrari";
import { Garage } from "./Garage";

export type ViewState = "front" | "side" | "rear" | "wheels";

// Base camera positions (baseline)
const BASE_CAMERA_POSITIONS: Record<ViewState, { pos: [number, number, number], target: [number, number, number] }> = {
  front: {
    pos: [0, 1.0, 10.5],
    target: [0, 0.5, 0.5],
  },
  side: {
    pos: [-11.0, 1.0, 0],
    target: [0, 0.5, 0],
  },
  rear: {
    pos: [0, 1.0, -10.5],
    target: [0, -1, 0],
  },
  wheels: {
    pos: [-6.5, -2, 3.0],
    target: [8, -3, 6.2],
  },
};

// All locked calibration values
const CAR_X_OFFSET = -6.7;
const CAR_Z_OFFSET = -4.5;
const CAR_Y_OFFSET = 0.05;
const GARAGE_Y_OFFSET = 6.26;
const CAR_SCALE = 3.5;

// Your measured camera distance multiplier
const CAM_MULTIPLIER = 1.6;

export function Experience({ activeView }: { activeView: ViewState }) {
  const [controls, setControls] = useState<any>(null);

  // Smoothly transition camera profiles and apply the 1.6 multiplier
  useEffect(() => {
    if (controls) {
      const { pos, target } = BASE_CAMERA_POSITIONS[activeView];

      controls.setLookAt(
        pos[0] * CAM_MULTIPLIER + CAR_X_OFFSET,
        pos[1] * CAM_MULTIPLIER,
        pos[2] * CAM_MULTIPLIER + CAR_Z_OFFSET, // Scaled Camera Position

        target[0] + CAR_X_OFFSET,
        target[1],
        target[2] + CAR_Z_OFFSET, // Fixed Target on the car's center
        true
      );
    }
  }, [controls, activeView]);

  return (
    <Canvas
      camera={{
        position: [
          BASE_CAMERA_POSITIONS.side.pos[0] * CAM_MULTIPLIER + CAR_X_OFFSET,
          BASE_CAMERA_POSITIONS.side.pos[1] * CAM_MULTIPLIER,
          BASE_CAMERA_POSITIONS.side.pos[2] * CAM_MULTIPLIER + CAR_Z_OFFSET
        ],
        fov: 45
      }}
      dpr={[1, 2]}
      // Lowered exposure from 1.2 to 0.9 to prevent highlight clipping
      gl={{ antialias: true, toneMappingExposure: 0.9 }}
    >
      <color attach="background" args={["rgba(255, 255, 255, 1)"]} /> {/* Darker background to fit the hangar */}
      <fog attach="fog" args={["#0c0c0e", 20, 150]} />

      <CameraControls
        ref={setControls}
        minPolarAngle={Math.PI / 16}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2.5}
        maxDistance={25}
        smoothTime={0.4}
        makeDefault
      />

      {/* 
        1. Environment: "warehouse" is much more realistic for a garage/hangar.
           It adds realistic industrial ceiling reflections to your car paint.
      */}
      <Environment preset="warehouse" environmentIntensity={1} />

      {/* 
        2. Ambient Light: Dropped to 0.2 and tinted slightly dark blue/slate.
           This preserves shadow details and gives the scene realistic depth.
      */}
      <ambientLight intensity={0.2} color="#0f172a" />

      {/* 
        3. Key Directional Light: Overhead warm industrial illumination (slight off-white tint).
           Casts the main shadow.
      */}
      <directionalLight
        position={[5, 12, 5]}
        intensity={0.2}
        color="#fffaf0"
        castShadow
        shadow-mapSize={[2048, 2048]} // Higher resolution shadows
        shadow-bias={-0.0001}
      />

      {/* 
        4. Rim/Back Light: Cool slate blue light behind the car.
           This separates the car's edges from the dark background.
      */}
      <directionalLight
        position={[-5, 6, -5]}
        intensity={0.8}
        color="#e0f2fe"
      />

      {/* 
        5. Mood Accents: Soft, rich blue spotlight pointing down on the rear/scaffolding
      */}
      <spotLight
        position={[-3, 8, -6]}
        intensity={3.0}
        color="#2563eb"
        angle={0.6}
        distance={15}
        penumbra={1}
      />

      {/* 
        6. Mood Accents: A warm workspace lamp accent (soft amber/orange) on the side of the car
      */}
      <spotLight
        position={[3, 8, 6]}
        intensity={2.0}
        color="#f97316"
        angle={0.8}
        distance={15}
        penumbra={1}
      />

      {/* Garage */}
      <Garage
        scale={45}
        rotation={[0, -Math.PI / 2, 0]}
        position={[0, GARAGE_Y_OFFSET, 0]}
      />

      {/* Ferrari Group */}
      <group position={[CAR_X_OFFSET, CAR_Y_OFFSET, CAR_Z_OFFSET]} scale={CAR_SCALE}>
        <Center bottom disableX disableZ>
          <Ferrari scale={1} />
        </Center>
      </group>

      <ContactShadows
        resolution={1024}
        scale={20}
        blur={2.5}
        opacity={0.8}
        far={10}
        color="#000000"
        position={[CAR_X_OFFSET, CAR_Y_OFFSET, CAR_Z_OFFSET]}
      />
    </Canvas>
  );
}