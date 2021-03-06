import { Player, Ease, IPlayerApp } from "textalive-app-api";

import ControlPanel, { loadConfigValue, PanelConfig } from "./control-panel";
import { safetyGetElementById } from "./utils";
import createLyricsManager, { LyricsManager } from "./lyrics/manager";
import createLyricsRenderer from "./lyrics/renderer";
import createSideInfoRenderer, { SideInfoRenderer } from "./side-info/renderer";

interface Props {
  scene: THREE.Scene;
  token: string;
  fontLoader: Promise<void>;
}

export const initializePlayer = ({ scene, token, fontLoader }: Props) => {
  const player = new Player({
    app: {
      token,
    },
    valenceArousalEnabled: true,
    vocalAmplitudeEnabled: true,
  });

  const lyricsManager = createLyricsManager({
    player,
    renderer: createLyricsRenderer({ scene }),
    elements: {
      phrase: safetyGetElementById("phrase"),
      word: safetyGetElementById("word"),
    },
  });

  const songInfoRenderer = createSideInfoRenderer({ scene });

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
    fontLoader,
  });
  const onAppReady = handleOnAppReady();
  const onVideoReady = handleOnVideoReady(songInfoRenderer, {
    song: safetyGetElementById("song"),
    artist: safetyGetElementById("artist"),
  });
  const onTimerReady = handleOnTimerReady({
    spinner: safetyGetElementById("loading"),
  });
  const onTimeUpdate = handleOnTimeUpdate(lyricsManager, {
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
  const onPause = handleOnPause(lyricsManager);
  const onStop = handleOnStop(lyricsManager);
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

const handlePlayer = ({
  player,
  fontLoader,
}: {
  player: Player;
  fontLoader: Promise<void>;
}) => ({
  handleOnAppReady: () => (app: IPlayerApp) => {
    if (!app.songUrl) {
      // ????????????????????????
      player.createFromSongUrl(loadConfigValue(PanelConfig.MUSIC));
      player.volume = Number(loadConfigValue(PanelConfig.VOLUME));
    }
  },
  handleOnVideoReady:
    (
      renderer: SideInfoRenderer,
      elements: { song: Element; artist: Element }
    ) =>
    () => {
      const { song } = player.data;
      elements.artist.textContent = song.artist.name;
      elements.song.textContent = song.name;
      ControlPanel.initSeekBar(song.length);
      renderer.showSongInfo({
        title: song.name,
        artist: song.artist.name,
      });
    },
  handleOnTimerReady: (elements: { spinner: Element }) => async () => {
    await fontLoader;
    // ?????????????????????????????????
    elements.spinner.classList.add("loaded");
    player.video && player.requestPlay();
  },
  handleOnTimeUpdate:
    (
      manager: LyricsManager,
      elements: {
        beats: Element;
        chords: Element;
        va: {
          valence: Element;
          arousal: Element;
          result: Element;
        };
        amplitude: Element;
      }
    ) =>
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

      manager.update(position);
    },
  handleOnPlay: () => () => {
    /** */
  },
  handleOnPause: (manager: LyricsManager) => () => {
    manager.pause();
  },
  handleOnStop: (manager: LyricsManager) => () => {
    manager.stop();
  },
  handleOnMediaSeek: () => (position: number) => {
    ControlPanel.updateSeekBar(position);
  },
});
