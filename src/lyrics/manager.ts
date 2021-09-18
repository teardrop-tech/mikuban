import { IPhrase, ITextUnit, IWord, Timer } from "textalive-app-api";

import { LyricRenderer } from "./renderer";

interface State {
  currentPhrase?: IPhrase;
  currentWord?: IWord;
}

interface Props {
  renderer: LyricRenderer;
  timer: Timer;
  elements: {
    phrase: Element;
    word: Element;
  };
  phrases: IPhrase[];
}

export interface LyricsManager {
  update: () => void;
}

const getObject = <T extends ITextUnit>(units: T[]) => ({
  at: (time: number) => units.find((unit) => unit.contains(time)),
});

export default ({
  timer,
  phrases,
  elements,
  renderer,
}: Props): LyricsManager => {
  const state = {} as State;

  const updatePhrase = () => {
    const phrase = timer.isPlaying
      ? getObject(phrases).at(timer.position)
      : undefined;

    const phraseChanged = state.currentPhrase !== phrase;
    if (phraseChanged) {
      elements.phrase.textContent = phrase?.text ?? "-";
      renderer.renderPhrase(phrase);
      state.currentPhrase = phrase;
    }

    return phrase;
  };

  const updateWord = (phrase?: IPhrase) => {
    const word =
      timer.isPlaying && phrase
        ? getObject(phrase.children).at(timer.position)
        : undefined;

    const wordChanged = state.currentWord !== word;
    if (wordChanged) {
      elements.word.textContent = word?.text ?? "-";
      state.currentWord = word;
    }
  };

  return {
    update: () => {
      const phrase = updatePhrase();
      updateWord(phrase);
    },
  };
};
