import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 2, 5);

const loader = new GLTFLoader();
let car, mixer;

// 1. Load the main car (scene.gltf)
loader.load('scene.gltf', (gltf) => {
  car = gltf.scene;
  scene.add(car);
  mixer = new THREE.AnimationMixer(car);

  // 2. Load animations (engine bay, left door, right door)
  Promise.all([
    loader.loadAsync('engine bay.glb'),
    loader.loadAsync('left door.glb'),
    loader.loadAsync('right door.glb')
  ]).then(([engineBay, leftDoor, rightDoor]) => {
    const clips = [
      ...engineBay.animations,
      ...leftDoor.animations,
      ...rightDoor.animations
    ];

    clips.forEach((clip, i) => {
      const action = mixer.clipAction(clip, car);
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;
      window[`anim${i}`] = action;
    });
  });
});

// 3. Button bindings
document.getElementById('openEngineBay').onclick = () => window.anim0.play();
document.getElementById('openLeftDoor').onclick = () => window.anim1.play();
document.getElementById('openRightDoor').onclick = () => window.anim2.play();

// 4. Render loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}
animate();
