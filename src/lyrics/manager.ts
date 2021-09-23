import { Player, IPhrase, ITextUnit, IWord } from "textalive-app-api";
import { lyricsFadeTimeMs } from "../definition";

import { LyricRenderer } from "./renderer";

interface State {
  currentPhrase?: IPhrase;
  currentWord?: IWord;
}

interface Props {
  player: Player;
  renderer: LyricRenderer;
  elements: {
    phrase: Element;
    word: Element;
  };
}

export interface LyricsManager {
  update: (position?: number) => void;
  pause: () => void;
  stop: () => void;
}

const getObject = <T extends ITextUnit>(units: T[]) => ({
  at: (time: number) => {
    const results = units.filter((unit) =>
      unit.overlaps(time - lyricsFadeTimeMs, time + lyricsFadeTimeMs)
    );
    // フェードイン処理を優先
    return results.length ? results[results.length - 1] : undefined;
  },
});

export default ({ player, elements, renderer }: Props): LyricsManager => {
  const state = {} as State;

  const updatePhrase = (position?: number) => {
    const { phrases } = player.video;
    const phrase = position ? getObject(phrases).at(position) : undefined;

    const phraseChanged = state.currentPhrase !== phrase;
    if (phraseChanged) {
      elements.phrase.textContent = phrase?.text ?? "-";
      renderer.renderPhrase(phrase);
      state.currentPhrase = phrase;
    }

    // フェード処理
    if (phrase && position) {
      const startDiff = phrase.startTime - position;
      const endDiff = position - phrase.endTime;
      if (0 < startDiff && startDiff < lyricsFadeTimeMs) {
        const opacity = 1 - startDiff / lyricsFadeTimeMs;
        renderer.changeOpacity(opacity);
      } else if (0 < endDiff && endDiff < lyricsFadeTimeMs) {
        const opacity = 1 - endDiff / lyricsFadeTimeMs;
        renderer.changeOpacity(opacity);
      } else {
        renderer.changeOpacity(1);
      }
    }

    return phrase;
  };

  const updateWord = (phrase?: IPhrase, position?: number) => {
    const word =
      phrase && position ? getObject(phrase.children).at(position) : undefined;
    const wordChanged = state.currentWord !== word;
    if (wordChanged) {
      elements.word.textContent = word?.text ?? "-";
      state.currentWord = word;
    }
  };

  const clear = () => {
    updatePhrase(-1);
    updateWord(undefined, -1);
  };

  return {
    update: (position) => {
      const phrase = updatePhrase(position);
      updateWord(phrase, position);
    },
    pause: clear,
    stop: clear,
  };
};
