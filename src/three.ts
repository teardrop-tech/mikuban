import * as THREE from "three";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";

interface State {
  textMeshes: Record<string, THREE.Mesh>;
  lastText: string;
}

const initState: State = {
  textMeshes: {},
  lastText: "",
};

export interface ThreeWrapper {
  scene: THREE.Scene;
  font: THREE.Font;
  play: () => void;
  addTextMesh: (text: string) => void;
  resetTextMesh: () => void;
  showTextMeshToScene: (text: string) => void;
  removeTextMeshFromScene: () => void;

  /**
   * 画面のリサイズ
   * @param {number} width 画面の幅
   * @param {number} height 画面の高さ
   */
  resizeDisplay: (width: number, height: number) => void;
}

export const setupThree = (): Promise<ThreeWrapper> =>
  new Promise((resolve) => {
    const canvas = document.querySelector("#three") as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    const aspect: number = width / height;

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, aspect);
    camera.position.set(0, 0, 500);
    camera.lookAt(scene.position);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const texture = new THREE.TextureLoader().load("texture.png");
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

    const state = initState;

    const loader = new TTFLoader();
    loader.load("TanukiMagic.ttf", (json: unknown) => {
      const font = new THREE.FontLoader().parse(json);
      const play = () => {
        renderer.render(scene, camera);
        requestAnimationFrame(play);
      };
      const addTextMesh = (text: string) => {
        state.textMeshes = {
          ...state.textMeshes,
          [text]: new THREE.Mesh(
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
          ),
        };
      };
      const showTextMeshToScene = (text: string) => {
        if (state.lastText === text) {
          return;
        }
        const mesh = state.textMeshes[text];
        if (!mesh) {
          return;
        }
        removeTextMeshFromScene();
        scene.add(mesh);
        state.lastText = text;
      };
      const resetTextMesh = () => {
        state.textMeshes = initState.textMeshes;
        state.lastText = initState.lastText;
      };
      const removeTextMeshFromScene = () => {
        if (!state.lastText) {
          return;
        }
        const mesh = state.textMeshes[state.lastText];
        if (!mesh) {
          return;
        }
        scene.remove(mesh);
        state.lastText = "";
      };
      const resizeDisplay = (width: number, height: number) => {
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        camera.aspect = width / height;
      };
      resolve({
        scene,
        font,
        play,
        addTextMesh,
        resetTextMesh,
        showTextMeshToScene,
        removeTextMeshFromScene,
        resizeDisplay,
      });
    });
  });
