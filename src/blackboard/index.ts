import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "meshline";

interface Props {
  scene: THREE.Scene;
}

const drawFrame = ({ scene }: Props) => {
  const texture = new THREE.TextureLoader().load(
    "texture/blackboard_frame.png"
  );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(0.01, 0.01);
  const frameTexture = new THREE.TextureLoader().load(
    "texture/blackboard_frame.png"
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
};

const drawShadow = ({ scene }: Props) => {
  const frameTexture = new THREE.TextureLoader().load(
    "texture/blackboard_frame_shadow.png"
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
  points.push(-window.innerWidth / 2 + 10, -window.innerHeight / 2 + 10, 10);
  points.push(-window.innerWidth / 2 + 10, window.innerHeight / 2 - 10, 10);
  points.push(window.innerWidth / 2 - 10, window.innerHeight / 2 - 10, 10);
  points.push(window.innerWidth / 2 - 10, -window.innerHeight / 2 + 10, 10);
  points.push(-window.innerWidth / 2 + 10, -window.innerHeight / 2 + 10, 10);

  meshLine.setPoints(points);

  const mesh = new THREE.Mesh(meshLine.geometry, meshMaterial);
  mesh.position.setZ(1);
  scene.add(mesh);
};

export default ({ scene }: Props) => {
  drawFrame({ scene });
  drawShadow({ scene });
};
