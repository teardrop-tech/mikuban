import * as THREE from "three";
import DrawBlackBoard from "./blackboard";

export interface ThreeWrapper {
  play: () => void;
  scene: THREE.Scene;
  camera: THREE.Camera;
  canvas: HTMLCanvasElement;
}

export const setupThree = (): ThreeWrapper => {
  const canvas = document.querySelector("#three") as HTMLCanvasElement;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    preserveDrawingBuffer: true,
  });

  const { innerWidth, innerHeight } = window;

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(
    innerWidth / -2, // left
    innerWidth / 2, // right
    innerHeight / 2, // top
    innerHeight / -2, // bottom
    1, // near
    1000 // far
  );
  camera.position.set(0, 0, 500);
  camera.lookAt(scene.position);

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  scene.add(
    new THREE.Mesh(
      new THREE.PlaneGeometry(innerWidth, innerHeight),
      new THREE.MeshBasicMaterial({ color: 0x3d5347 })
    )
  );

  const play = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(play);
  };

  // 画面リサイズ時のコールバックの設定
  addEventListener("resize", () => {
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  });

  // 黒板の縁の表示
  DrawBlackBoard({ scene });

  return {
    play,
    scene,
    camera,
    canvas,
  };
};
