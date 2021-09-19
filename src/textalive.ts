import { Player, Ease, IPlayerApp } from "textalive-app-api";

import { ThreeWrapper } from "./three";
import ControlPanel from "./control-panel";
import { safetyGetElementById } from "./utils";
import { musicList } from "./definition";

export const initializePlayer = ({
  three,
  token,
}: {
  three: ThreeWrapper;
  token: string;
}) => {
  const player = new Player({
    app: {
      token,
    },
    valenceArousalEnabled: true,
    vocalAmplitudeEnabled: true,
  });

  const {
    handleOnAppReady,
    handleOnVideoReady,
    handleOnTimerReady,
    handleOnTimeUpdate,
    handleOnPlay,
    handleOnPause,
    handleOnStop,
    handleOnMediaSeek,
  } = handlePlayer({
    player,
    three,
  });
  const onAppReady = handleOnAppReady();
  const onVideoReady = handleOnVideoReady({
    song: safetyGetElementById("song"),
    artist: safetyGetElementById("artist"),
    phrase: safetyGetElementById("phrase"),
    word: safetyGetElementById("word"),
  });
  const onTimerReady = handleOnTimerReady({
    spinner: safetyGetElementById("loading"),
  });
  const onTimeUpdate = handleOnTimeUpdate({
    beats: safetyGetElementById("beats"),
    chords: safetyGetElementById("chords"),
    va: {
      valence: safetyGetElementById("va-valence"),
      arousal: safetyGetElementById("va-arousal"),
      result: safetyGetElementById("va-result"),
    },
    amplitude: safetyGetElementById("amplitude"),
  });
  const onPlay = handleOnPlay();
  const onPause = handleOnPause({
    phrase: safetyGetElementById("phrase"),
    word: safetyGetElementById("word"),
  });
  const onStop = handleOnStop({
    phrase: safetyGetElementById("phrase"),
    word: safetyGetElementById("word"),
  });
  const onMediaSeek = handleOnMediaSeek();
  player.addListener({
    onAppReady,
    onVideoReady,
    onTimerReady,
    onTimeUpdate,
    onPlay,
    onPause,
    onStop,
    onMediaSeek,
  });

  return player;
};

export const handlePlayer = ({
  player,
  three,
}: {
  player: Player;
  three: ThreeWrapper;
}) => ({
  handleOnAppReady: () => (app: IPlayerApp) => {
    if (!app.songUrl) {
      // デフォルト選択曲
      player.createFromSongUrl(musicList[0]?.value);
    }
  },
  handleOnVideoReady:
    (elements: {
      song: Element;
      artist: Element;
      phrase: Element;
      word: Element;
    }) =>
    () => {
      const { song } = player.data;

      // シークバーの設定
      ControlPanel.initSeekBar(player.data.song.length);

      elements.artist.textContent = song.artist.name;
      elements.song.textContent = song.name;
      three.showSongInfo({
        title: song.name,
        artist: song.artist.name,
      });

      three.resetTextMesh();
      const { firstPhrase, firstWord } = player.video;

      for (let phrase = firstPhrase; phrase; phrase = phrase.next) {
        three.addTextMesh(phrase.text);
        phrase.animate = (now, u) => {
          if (u.contains(now)) {
            elements.phrase.textContent = u.text;
            three.showTextMeshToScene(u.text);
          }
        };
      }

      for (let word = firstWord; word; word = word.next) {
        word.animate = (now, u) => {
          if (u.contains(now)) {
            elements.word.textContent = u.text;
          }
        };
      }
    },
  handleOnTimerReady: (elements: { spinner: Element }) => () => {
    // ローディング表示の解除
    elements.spinner.classList.add("loaded");
    // コントロールパネルから曲変更時は自動再生
    // https://developer.chrome.com/blog/autoplay/
    if (ControlPanel.getMusicChangeFlg()) {
      player.video && player.requestPlay();
      ControlPanel.setMusicChangeFlg(false);
    }
  },
  handleOnTimeUpdate:
    (elements: {
      beats: Element;
      chords: Element;
      va: {
        valence: Element;
        arousal: Element;
        result: Element;
      };
      amplitude: Element;
    }) =>
    (position: number) => {
      const beat = player.findBeat(position);
      const progress = Math.ceil(Ease.circIn(beat.progress(position)) * 100);
      elements.beats.textContent = `${beat.position} / ${beat.length} [${progress}%]`;
      const chord = player.findChord(position);
      elements.chords.textContent = chord.name;
      const va = player.getValenceArousal(position);
      elements.va.valence.textContent = va.v.toString();
      elements.va.arousal.textContent = va.v.toString();
      elements.va.result.textContent = (va.v / va.a).toString();
      const amplitude = player.getVocalAmplitude(position);
      elements.amplitude.textContent = amplitude.toString();
    },
  handleOnPlay: () => () => console.log("▶️ Start playing"),
  handleOnPause: (elements: { phrase: Element; word: Element }) => () => {
    elements.phrase.textContent = "-";
    elements.word.textContent = "-";
  },
  handleOnStop: (elements: { phrase: Element; word: Element }) => () => {
    elements.phrase.textContent = "-";
    elements.word.textContent = "-";
    three.removeTextMeshFromScene();
  },
  handleOnMediaSeek: () => (position: number) => {
    ControlPanel.updateSeekBar(position);
  },
});
