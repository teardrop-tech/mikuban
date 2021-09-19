import { Player, IPhrase, ITextUnit, IWord } from "textalive-app-api";

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
  at: (time: number) => units.find((unit) => unit.contains(time)),
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
