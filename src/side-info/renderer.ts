import * as THREE from "three";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Text } from "troika-three-text";

import { font as ChalkFont } from "../font-loader";

interface SongInfo {
  title: string;
  artist: string;
}

export interface SideInfoRenderer {
  showSongInfo: (info: SongInfo) => void;
}

interface Props {
  scene: THREE.Scene;
}

const createText = (material: THREE.Material) => {
  const text = new Text();
  // https://github.com/protectwise/troika/issues/88
  text.font = ChalkFont;
  text.textAlign = "center";
  text.anchorX = "center";
  text.anchorY = "bottom";
  text.lineHeight = 1.2;
  text.material = material;
  text.color = 0xffffff;
  return text;
};

const showDate = ({
  scene,
  material,
}: {
  scene: THREE.Scene;
  material: THREE.Material;
}) => {
  const text = createText(material);
  text.fontSize = innerHeight * 0.05;
  text.text = toVerticalDate(new Date());
  const offset = {
    x: innerWidth * 0.05,
    y: innerHeight * 0.12,
  };
  text.position.set(innerWidth / 2 - offset.x, offset.y, 1);
  scene.add(text);
};

const showSongTitle = ({
  scene,
  material,
}: {
  scene: THREE.Scene;
  material: THREE.Material;
}): Text => {
  const text = createText(material);
  text.fontSize = innerHeight * 0.04;
  text.anchorX = "left";
  text.anchorY = "top";
  const offset = {
    x: innerWidth * 0.05 - innerWidth * 0.005,
    y: innerHeight * 0.1,
  };
  text.position.set(innerWidth / 2 - offset.x, offset.y, 1);
  scene.add(text);
  return text;
};

const showSongArtist = ({
  scene,
  material,
}: {
  scene: THREE.Scene;
  material: THREE.Material;
}): Text => {
  const text = createText(material);
  text.fontSize = innerHeight * 0.04;
  text.anchorX = "right";
  text.anchorY = "top";
  const offset = {
    x: innerWidth * 0.05 + innerWidth * 0.005,
    y: innerHeight * 0.1,
  };
  text.position.set(innerWidth / 2 - offset.x, offset.y, 1);
  scene.add(text);
  return text;
};

export default ({ scene }: Props): SideInfoRenderer => {
  const texture = new THREE.TextureLoader().load("texture.png");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  const textureScale = innerWidth * 0.001;
  texture.repeat.set(textureScale, textureScale);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
  });

  showDate({ scene, material });
  const title = showSongTitle({ scene, material });
  const artist = showSongArtist({ scene, material });

  return {
    showSongInfo: (info) => {
      title.text = toVertical(info.title);
      artist.text = toVertical(info.artist);
    },
  };
};

const toVertical = (text: string) => text.split("").join("\n");

const toVerticalDate = (cal: Date) => {
  const month = cal.getMonth() + 1;
  const date = cal.getDate();
  const day = ["日", "月", "火", "水", "木", "金", "土"][cal.getDay()];
  return [month, "月", date, "日", `(${day})`].join("\n");
};
