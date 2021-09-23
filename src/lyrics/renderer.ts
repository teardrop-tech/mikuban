import * as THREE from "three";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Text } from "troika-three-text";
import { IPhrase, IWord } from "textalive-app-api";

import { font as ChalkFont } from "../font-loader";

export interface LyricRenderer {
  renderPhrase: (phrase?: IPhrase) => void;
  changeOpacity: (progress: number) => void;
}

interface Props {
  scene: THREE.Scene;
}

const MAX_PHRASE_WIDTH = 20;

// https://stackoverflow.com/questions/94037/convert-character-to-ascii-code-in-javascript/94049
const isASCII = (char: string) => char.charCodeAt(0) < 128;

const wordWidth = (word: IWord) =>
  word.children.reduce(
    // ASCII 文字を半角、それ以外を全角（半角2つ分）として扱う
    (result, char) => result + (isASCII(char.text) ? 1 : 2),
    0
  );

const fitPhrase = (phrase?: IPhrase): string => {
  if (!phrase) {
    return "";
  }
  const { text } = phrase.children.reduce(
    (result, word) => {
      const width = wordWidth(word);

      const tooLongWord = width > MAX_PHRASE_WIDTH;
      if (tooLongWord) {
        throw Error(`The word is too long: ${word.text}`);
      }

      // 1列の文字幅がはみ出た場合は改行させる
      const stickedOut = result.width + width > MAX_PHRASE_WIDTH;
      if (stickedOut) {
        return {
          text: result.text + "\n" + word.text,
          width,
        };
      }

      return {
        text: result.text + word.text,
        width: result.width + width,
      };
    },
    {
      text: "",
      width: 0,
    }
  );

  return text;
};

export default ({ scene }: Props): LyricRenderer => {
  const texture = new THREE.TextureLoader().load("texture.png");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  const textureScale = window.innerWidth * 0.005;
  texture.repeat.set(textureScale, textureScale);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
  });
  const text = new Text();
  // https://github.com/protectwise/troika/issues/88
  text.font = ChalkFont;
  text.fontSize = window.innerWidth * 0.08;
  text.textAlign = "center";
  text.anchorX = "center";
  text.anchorY = "middle";
  text.material = material;
  text.color = 0xffffff;
  scene.add(text);

  let next: IPhrase | undefined;

  return {
    renderPhrase: (phrase) => {
      if (!phrase && next) {
        // 次のフレーズをあらかじめロード
        text.text = fitPhrase(next);
        text.material.opacity = 0;
        next = undefined;
      } else {
        if (phrase == next) {
          text.material.opacity = 1;
        } else {
          text.text = fitPhrase(phrase);
        }
        next = phrase?.next;
      }
      text.sync();
    },
    changeOpacity: (progress) => {
      text.material.opacity = progress;
      text.sync();
    },
  };
};
