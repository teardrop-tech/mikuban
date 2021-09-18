import * as THREE from "three";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { MeshLine, MeshLineMaterial } from "meshline";
import { IPhrase, Timer } from "textalive-app-api";

import { toVertical, toVerticalDate } from "./utils";
import createLyricsManager, { LyricsManager } from "./lyrics/manager";
import createLyricsRenderer from "./lyrics/renderer";

interface SongInfo {
  title: string;
  artist: string;
}

interface State {
  textMap: Record<string, string>;
  lastText: string;
  lastMesh: THREE.Mesh | null;
  lyricsManager?: LyricsManager;
}

const initState: State = {
  textMap: {},
  lastText: "",
  lastMesh: null,
};

const fontCommonParams = {
  height: 0,
  bevelEnabled: true,
  bevelThickness: 0,
  bevelSize: 1,
  bevelSegments: 1,
};
export interface ThreeWrapper {
  play: () => void;
  showSongInfo: (info: SongInfo) => void;

  onOnVideoReady: (
    phrases: IPhrase[],
    timer: Timer,
    elements: {
      phrase: Element;
      word: Element;
    }
  ) => void;

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
    const meshMaterial = new MeshLineMaterial({
      useMap: 1,
      map: paintTexture,
      color: 0xffffff, // TODO: Change color
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      sizeAttenuation: 1,
      lineWidth: 12, // TODO: Change bold
      repeat: new THREE.Vector2(3, 1),
    });
    meshMaterial.depthTest = false;
    meshMaterial.transparent = true;

    const raycaster = new THREE.Raycaster();
    const points = new Array<number>();
    let moved = false;
    // TODO: Fire touch event
    window.addEventListener("pointermove", (event: PointerEvent) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      if (moved) {
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
    window.addEventListener("pointerdown", () => {
      moved = true;
    });
    window.addEventListener("pointerup", () => {
      moved = false;
      points.splice(0, points.length);
      meshLine = new MeshLine();
      scene.add(new THREE.Mesh(meshLine.geometry, meshMaterial));
    });

    const state = initState;

    let font: THREE.Font;
    const loader = new TTFLoader();
    loader.load("TanukiMagic.ttf", (json: unknown) => {
      font = new THREE.FontLoader().parse(json);

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
        state.lyricsManager?.update();

        renderer.render(scene, camera);
        requestAnimationFrame(play);
      };

      const resizeDisplay = (width: number, height: number) => {
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
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

      const onOnVideoReady = (
        phrases: IPhrase[],
        timer: Timer,
        elements: { phrase: Element; word: Element }
      ) => {
        state.lyricsManager = createLyricsManager({
          timer,
          phrases,
          elements,
          renderer: createLyricsRenderer({
            font,
            scene,
            material,
          }),
        });
      };

      resolve({
        play,
        showSongInfo,
        resizeDisplay,
        onOnVideoReady,
      });
    });
  });
