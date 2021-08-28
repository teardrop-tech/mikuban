import { setupThree, ThreeWrapper } from "./three";
import { initializePlayer } from "./textalive";
import { safetyGetElementById } from "./utils";
import Paint from "./paint";
import ControlPanel from "./controlPanel";

window.onload = async () => {
  if (process.env.DEBUG) {
    safetyGetElementById("debug").style.display = "block";
  }

  const three = await setupThree();

  // 画面リサイズ時のコールバックの設定
  window.addEventListener("resize", resizeDisplay(three));

  const player = initializePlayer({
    three,
    token: process.env.TOKEN ?? "",
  });

  // ペイント初期化
  Paint.init();

  // コントロールパネルの表示
  ControlPanel.init(player);

  three.play();
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
