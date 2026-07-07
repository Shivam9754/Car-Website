import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export function Garage(props: any) {
  const { scene } = useGLTF("/garage_nfs_2015/scene.gltf");

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.Material) {
          mesh.receiveShadow = true;
          mesh.castShadow = false; // Prevent garage shell from blacking itself out

          if ('envMapIntensity' in mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).envMapIntensity = 2.0;
          }
          if ('lightMap' in mesh.material || 'aoMap' in mesh.material) {
            // Ensure existing map channels are bright enough
          }
          mesh.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload("/garage_nfs_2015/scene.gltf");
