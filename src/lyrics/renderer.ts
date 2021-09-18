import * as THREE from "three";
import { IPhrase, IWord } from "textalive-app-api";

interface State {
  phraseMesh?: THREE.Mesh;
}

export interface LyricRenderer {
  renderPhrase: (phrase?: IPhrase) => void;
}

interface Props {
  font: THREE.Font;
  scene: THREE.Scene;
  material: THREE.Material[];
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

const fitPhrase = (phrase: IPhrase): string => {
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

export default ({ font, scene, material }: Props): LyricRenderer => {
  const state = {} as State;

  return {
    renderPhrase: (phrase) => {
      if (state.phraseMesh) {
        scene.remove(state.phraseMesh);
      }

      if (!phrase) {
        state.phraseMesh = undefined;
        return;
      }

      const text = fitPhrase(phrase);
      const mesh = new THREE.Mesh(
        new THREE.TextGeometry(text, {
          font,
          size: 40,
          height: 0,
          bevelEnabled: true,
          bevelThickness: 0,
          bevelSize: 1,
          bevelSegments: 1,
        }).center(),
        material
      );
      mesh.scale.setScalar(window.innerWidth / 700);
      scene.add(mesh);
      state.phraseMesh = mesh;
    },
  };
};
