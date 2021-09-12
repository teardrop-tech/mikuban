import * as THREE from "three";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { MeshLine, MeshLineMaterial } from "meshline";
import ControlPanel from "./control-panel";

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
    const renderer = new THREE.WebGLRenderer({ canvas });

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

    const paintTexture = new THREE.TextureLoader().load("texture.png");
    paintTexture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    let meshLine = new MeshLine();
    let meshMaterial = new MeshLineMaterial({
      useMap: 1,
      map: paintTexture,
      color: 0xffffff,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      sizeAttenuation: 1,
      lineWidth: 12,
      repeat: new THREE.Vector2(3, 1),
    });
    meshMaterial.depthTest = false;
    meshMaterial.transparent = true;

    const raycaster = new THREE.Raycaster();
    const points = new Array<number>();

    let isTouching = false;

    const generateMeshLine = () => {
      points.splice(0, points.length);
      meshLine = new MeshLine();
      meshMaterial = new MeshLineMaterial({
        useMap: 1,
        map: paintTexture,
        color: ControlPanel.getLineColor(),
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        sizeAttenuation: 1,
        lineWidth: ControlPanel.getLineWidth(),
        repeat: new THREE.Vector2(3, 1),
      });
      meshMaterial.depthTest = false;
      meshMaterial.transparent = true;
      scene.add(new THREE.Mesh(meshLine.geometry, meshMaterial));
    };

    window.addEventListener("mousedown", () => {
      isTouching = true;
      generateMeshLine();
    });
    window.addEventListener("mouseup", () => {
      isTouching = false;
    });
    window.addEventListener("mouseout", () => {
      isTouching = false;
    });
    window.addEventListener("mousemove", (event) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      if (isTouching) {
        raycaster.setFromCamera(mouse, camera);
        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects?.length > 0) {
          const point = intersects[0]?.point;
          if (point) {
            points.push(point.x); // X
            points.push(point.y); // Y
            points.push(1); // Z
            meshLine.setPoints(points);
          }
        }
      }
    });

    window.addEventListener("touchstart", () => {
      isTouching = true;
      generateMeshLine();
    });
    window.addEventListener("touchend", () => {
      isTouching = false;
    });
    window.addEventListener("touchmove", (event) => {
      const touchList: TouchList = event.changedTouches;
      // ファーストタッチのみ処理
      const touch: Touch | undefined = touchList[0];

      if (!touch) return;

      const touchX = (touch.clientX / window.innerWidth) * 2 - 1;
      const touchY = -(touch.clientY / window.innerHeight) * 2 + 1;

      const mouse = new THREE.Vector2(touchX, touchY);

      if (isTouching) {
        raycaster.setFromCamera(mouse, camera);
        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children, false);
        if (intersects?.length > 0) {
          const point = intersects[0]?.point;
          if (point) {
            points.push(point.x); // X
            points.push(point.y); // Y
            points.push(1); // Z
            meshLine.setPoints(points);
          }
        }
      }
    });

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
