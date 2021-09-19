import * as THREE from "three";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { MeshLine, MeshLineMaterial } from "meshline";

import { toVertical, toVerticalDate } from "./utils";
import { theme, paintSettings } from "./definition";

interface SongInfo {
  title: string;
  artist: string;
}

interface State {
  font?: THREE.Font;
  paintMeshes: Array<THREE.Mesh>;
}

const initState: State = {
  paintMeshes: [],
};

const fontCommonParams = {
  height: 0,
  bevelEnabled: true,
  bevelThickness: 0,
  bevelSize: 1,
  bevelSegments: 1,
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
  showSongInfo: (info: SongInfo) => void;

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

  getRenderer: () => {
    scene: THREE.Scene;
    font: THREE.Font;
    material: THREE.Material | THREE.Material[];
  };
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

    const loader = new TTFLoader();
    loader.load("TanukiMagic.ttf", (json: unknown) => {
      const font = new THREE.FontLoader().parse(json);
      state.font = font;

      const dateMesh = new THREE.Mesh(
        new THREE.TextGeometry(toVerticalDate(new Date()), {
          ...fontCommonParams,
          font,
          size: 14,
        }).center(),
        material
      );
      dateMesh.position.set(window.innerWidth / 2 - 55, 100, 1);
      scene.add(dateMesh);

      const musicInfoMesh = new THREE.Mesh(
        new THREE.TextGeometry("楽曲", {
          ...fontCommonParams,
          font,
          size: 14,
        }).center(),
        material
      );
      musicInfoMesh.position.set(window.innerWidth / 2 - 55, 0, 1);
      scene.add(musicInfoMesh);

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

      const lastSongMeshes = new Array<THREE.Mesh>();
      const showSongInfo = ({ title, artist }: SongInfo) => {
        // Remove cached song info meshes
        lastSongMeshes.forEach((mesh) => {
          scene.remove(mesh);
        });
        lastSongMeshes.splice(0, lastSongMeshes.length);

        // Add song info meshes
        const params = {
          ...fontCommonParams,
          font,
          size: 13,
        };
        const titleMesh = new THREE.Mesh(
          new THREE.TextGeometry(toVertical(title), params),
          material
        );
        const artistMesh = new THREE.Mesh(
          new THREE.TextGeometry(toVertical(artist), params),
          material
        );
        titleMesh.position.set(window.innerWidth / 2 - 50, -40, 1);
        artistMesh.position.set(window.innerWidth / 2 - 70, -40, 1);
        scene.add(titleMesh);
        scene.add(artistMesh);

        // Cache meshes
        lastSongMeshes.push(titleMesh);
        lastSongMeshes.push(artistMesh);
      };

      resolve({
        play,
        showSongInfo,
        resizeDisplay,
        setLineWidth,
        setLineColor,
        setPrevLineColor,
        changePrevLineColor,
        clearPaintMesh,
        getRenderer: () => {
          const { font } = state;
          if (!font) {
            throw Error("Font is undefined");
          }
          return {
            font,
            scene,
            material,
          };
        },
      });
    });
  });
