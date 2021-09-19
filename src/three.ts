import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "meshline";

import { theme, paintSettings } from "./definition";

interface State {
  paintMeshes: Array<THREE.Mesh>;
}

const initState: State = {
  paintMeshes: [],
};

interface LineInfo {
  width: number;
  color: string;
  prevColor: string;
}

const lineInfo: LineInfo = {
  width: paintSettings.lineWidth,
  color: theme.color.miku,
  prevColor: theme.color.miku,
};

export interface ThreeWrapper {
  play: () => void;

  /**
   * 画面のリサイズ
   * @param {number} width 画面の幅
   * @param {number} height 画面の高さ
   */
  resizeDisplay: (width: number, height: number) => void;

  /**
   * ペイントの線の太さの設定
   * @param {number} width 線の太さ
   */
  setLineWidth: (width: number) => void;
  /**
   * ペイントの線の色を設定
   * @param {string} color 色
   */
  setLineColor: (color: string) => void;
  /**
   * ペイントの前回の線の色を設定
   * @param {string} color 色
   */
  setPrevLineColor: (color: string) => void;
  /**
   * 前回の線の色に変更
   */
  changePrevLineColor: () => void;
  /**
   * ペイントのクリア
   */
  clearPaintMesh: () => void;

  scene: THREE.Scene;
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
  const state = initState;

  let isTouching = false;

  const generateMeshLine = () => {
    points.splice(0, points.length);
    meshLine = new MeshLine();
    meshMaterial = new MeshLineMaterial({
      useMap: 1,
      map: paintTexture,
      color: lineInfo.color,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      sizeAttenuation: 1,
      lineWidth: lineInfo.width,
      repeat: new THREE.Vector2(3, 1),
    });
    meshMaterial.depthTest = false;
    meshMaterial.transparent = true;
    const mesh = new THREE.Mesh(meshLine.geometry, meshMaterial);
    state.paintMeshes.push(mesh);
    scene.add(mesh);
  };

  canvas.addEventListener("mousedown", () => {
    isTouching = true;
    generateMeshLine();
  });
  canvas.addEventListener("mouseup", () => {
    isTouching = false;
  });
  canvas.addEventListener("mouseout", () => {
    isTouching = false;
  });
  canvas.addEventListener("mousemove", (event) => {
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

  canvas.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
        return;
      }
      isTouching = true;
      generateMeshLine();
    },
    { passive: false }
  );
  window.addEventListener("touchend", () => {
    isTouching = false;
  });
  canvas.addEventListener("touchmove", (event) => {
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

  const play = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(play);
  };
  const resizeDisplay = (width: number, height: number) => {
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
  };
  const setLineWidth = (width: number) => {
    lineInfo.width = width;
  };
  const setLineColor = (color: string) => {
    lineInfo.prevColor = lineInfo.color;
    lineInfo.color = color;
  };
  const setPrevLineColor = (color: string) => {
    lineInfo.prevColor = color;
  };
  const changePrevLineColor = () => {
    lineInfo.color = lineInfo.prevColor;
  };
  const clearPaintMesh = () => {
    state.paintMeshes.forEach((mesh) => {
      scene.remove(mesh);
    });
    state.paintMeshes.splice(0);
  };

  return {
    play,
    resizeDisplay,
    setLineWidth,
    setLineColor,
    setPrevLineColor,
    changePrevLineColor,
    clearPaintMesh,
    scene,
  };
};
