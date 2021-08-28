import * as THREE from "three";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";

interface ThreeOption {
  debug?: boolean;
}

export interface ThreeWrapper {
  scene: THREE.Scene;
  font: THREE.Font;
  play: () => void;
  updateText: (text?: string) => void;

  /**
   * 画面のリサイズ
   * @param {number} width 画面の幅
   * @param {number} height 画面の高さ
   */
  resizeDisplay: (width: number, height: number) => void;
}

export const setupThree = (option?: ThreeOption): Promise<ThreeWrapper> =>
  new Promise((resolve) => {
    const canvas = document.querySelector("#three") as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas });

    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    const aspect: number = width / height;

    renderer.setClearColor(0x3d5347, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, aspect);
    camera.position.set(0, 0, 500);
    camera.lookAt(scene.position);
    if (option?.debug) {
      scene.add(new THREE.AxesHelper(1000));
    }
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const loader = new TTFLoader();
    loader.load("./public/TanukiMagic.ttf", (json: unknown) => {
      const font = new THREE.FontLoader().parse(json);
      const texture = new THREE.TextureLoader().load("public/texture.png");
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(0.01, 0.01);
      const material = [
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: texture,
          transparent: true,
        }),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
        }),
      ];
      let mesh: THREE.Mesh;
      resolve({
        scene,
        font,
        play: tick,
        updateText: (text = "") => {
          mesh && scene.remove(mesh);
          mesh = new THREE.Mesh(
            new THREE.TextGeometry(text.replace(/(.{10})/g, "$1\n"), {
              font,
              size: 48,
              height: 0,
              bevelEnabled: true,
              bevelThickness: 0,
              bevelSize: 1,
              bevelSegments: 1,
            }).center(),
            material
          );
          scene.add(mesh);
        },
        resizeDisplay: (width, height) => {
          renderer.setSize(width, height);
          renderer.setPixelRatio(window.devicePixelRatio);
          camera.aspect = width / height;
        },
      });
    });
    const tick = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };
  });
