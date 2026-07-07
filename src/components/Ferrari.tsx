import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export function Ferrari(props: any) {
  const { scene } = useGLTF(
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/ferrari.glb"
  );

  // Apply some simple material corrections if needed so it looks good out of the box
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.envMapIntensity = 1.5;
          mesh.material.needsUpdate = true;
          // You might also enable shadow casting
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload(
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/ferrari.glb"
);
