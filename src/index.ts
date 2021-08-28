import { Player } from "textalive-app-api";

import { setupThree, ThreeWrapper } from "./three";
import { handlePlayer } from "./textalive";
import Paint from "./paint";
import ControlPanel from "./controlPanel";

window.onload = async () => {
  const three = await setupThree({
    debug: false,
  });

  // 画面リサイズ時のコールバックの設定
  window.addEventListener("resize", resizeDisplay(three));

  const player = new Player({
    app: {
      token: process.env.TOKEN ?? "",
    },
    valenceArousalEnabled: true,
    vocalAmplitudeEnabled: true,
  });

  const {
    handleOnAppReady: onAppReady,
    handleOnVideoReady,
    handleOnTimerReady,
    handleOnTimeUpdate,
    handleOnThrottledTimeUpdate,
    handleOnMediaSeek: onMediaSeek,
    handleOnPlay: onPlay,
    handleOnPause,
    handleOnStop,
  } = handlePlayer({
    player,
    three,
  });
  const onVideoReady = handleOnVideoReady({
    artist: document.querySelector("#artist span"),
    song: document.querySelector("#song span"),
    word: document.querySelector("#text"),
    phrase: document.querySelector("#phrase"),
  });
  const onTimerReady = handleOnTimerReady({
    control: document.querySelector("#control"),
    word: document.querySelector("#text"),
    phrase: document.querySelector("#phrase"),
  });
  const onTimeUpdate = handleOnTimeUpdate({
    beats: document.querySelector("#beats"),
    chords: document.querySelector("#chords"),
    va: document.querySelector("#va"),
    amplitude: document.querySelector("#amplitude"),
  });
  const onThrottledTimeUpdate = handleOnThrottledTimeUpdate({
    position: document.querySelector("#position"),
  });
  const onPause = handleOnPause({
    word: document.querySelector("#text"),
    phrase: document.querySelector("#phrase"),
  });
  const onStop = handleOnStop({
    word: document.querySelector("#text"),
    phrase: document.querySelector("#phrase"),
  });
  player.addListener({
    onAppReady,
    onVideoReady,
    onTimerReady,
    onTimeUpdate,
    onThrottledTimeUpdate,
    onMediaSeek,
    onPlay,
    onPause,
    onStop,
  });

  three.play();

  // ペイント初期化
  Paint.init();

  // コントロールパネルの表示
  ControlPanel.init(player);
};

/**
 * 画面のリサイズ
 * @param {ThreeWrapper} three ThreeWrapperインスタンス
 */
const resizeDisplay = (three: ThreeWrapper) => () => {
  const width: number = window.innerWidth;
  const height: number = window.innerHeight;
  // three canvasのリサイズ
  three.resizeDisplay(width, height);
  // paint canvasのリサイズ
  Paint.setCanvasSize(width, height);
};
