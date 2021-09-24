import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "meshline";

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
  {
    // frame
    {
      const texture = new THREE.TextureLoader().load("blackboard_frame.png");
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(0.01, 0.01);
      const frameTexture = new THREE.TextureLoader().load(
        "blackboard_frame.png"
      );
      frameTexture.wrapS = frameTexture.wrapT = THREE.RepeatWrapping;

      const meshLine = new MeshLine();
      const meshMaterial = new MeshLineMaterial({
        useMap: 1,
        map: frameTexture,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        sizeAttenuation: 1,
        lineWidth: 30,
        repeat: new THREE.Vector2(3, 1),
      });
      meshMaterial.depthTest = false;
      meshMaterial.transparent = true;

      const points = [];
      points.push(-window.innerWidth / 2, -window.innerHeight / 2, 10);
      points.push(-window.innerWidth / 2, window.innerHeight / 2, 10);
      points.push(window.innerWidth / 2, window.innerHeight / 2, 10);
      points.push(window.innerWidth / 2, -window.innerHeight / 2, 10);
      points.push(-window.innerWidth / 2, -window.innerHeight / 2, 10);
      meshLine.setPoints(points);

      const mesh = new THREE.Mesh(meshLine.geometry, meshMaterial);
      mesh.position.setZ(1);
      scene.add(mesh);
    }
    // shadow
    {
      const texture = new THREE.TextureLoader().load(
        "blackboard_frame_shadow.png"
      );
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(0.01, 0.01);
      const frameTexture = new THREE.TextureLoader().load(
        "blackboard_frame_shadow.png"
      );
      frameTexture.wrapS = frameTexture.wrapT = THREE.RepeatWrapping;
      const meshLine = new MeshLine();

      const meshMaterial = new MeshLineMaterial({
        useMap: 1,
        map: frameTexture,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        sizeAttenuation: 1,
        lineWidth: 10,
        repeat: new THREE.Vector2(3, 1),
      });
      meshMaterial.depthTest = false;
      meshMaterial.transparent = true;

      const points = [];
      points.push(
        -window.innerWidth / 2 + 10,
        -window.innerHeight / 2 + 10,
        10
      );
      points.push(-window.innerWidth / 2 + 10, window.innerHeight / 2 - 10, 10);
      points.push(window.innerWidth / 2 - 10, window.innerHeight / 2 - 10, 10);
      points.push(window.innerWidth / 2 - 10, -window.innerHeight / 2 + 10, 10);
      points.push(
        -window.innerWidth / 2 + 10,
        -window.innerHeight / 2 + 10,
        10
      );

      meshLine.setPoints(points);

      const mesh = new THREE.Mesh(meshLine.geometry, meshMaterial);
      mesh.position.setZ(1);
      scene.add(mesh);
    }
  }

  return {
    play,
    scene,
    camera,
    canvas,
  };
};
