import { setupThree, ThreeWrapper } from "./three";
import { initializePlayer } from "./textalive";
import { isThemeColorId, safetyGetElementById } from "./utils";
import { theme } from "./definition";
import ControlPanel from "./control-panel";
import preloadFont from "./font-loader";

window.onload = () => {
  if (innerHeight > innerWidth) {
    alert("デバイスを横画面にしてください (＞人＜;)\nPlease use landscape 🙏");
    return;
  }

  if (process.env.DEBUG) {
    safetyGetElementById("debug").style.display = "block";
  }

  const three = setupThree();

  // 画面リサイズ時のコールバックの設定
  window.addEventListener("resize", resizeDisplay(three));

  const fontLoader = preloadFont();

  const player = initializePlayer({
    scene: three.scene,
    token: process.env.TOKEN ?? "",
    fontLoader,
  });

  // コントロールパネルの表示
  ControlPanel.init(player, three);

  // チョーク&黒板消しボタンの初期化
  initChalkButtons();

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
};

/**
 * チョークボタンの初期化
 */
const initChalkButtons = () => {
  const element = safetyGetElementById("chalks");
  element?.childNodes.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    button.disabled = false;

    // 黒板消し
    if (button.id === "eraser") {
      button.onclick = (ev) => {
        ev.preventDefault();
        ControlPanel.toggleEraserMode();
      };
      return;
    }

    // チョーク
    const colorId = button.id;
    if (isThemeColorId(colorId)) {
      const color = theme.color[colorId];
      button.style.backgroundColor = button.style.borderColor = color;
      button.onclick = (ev) => {
        ev.preventDefault();
        ControlPanel.changeColorPicker(color);
      };
      return;
    }

    throw new Error(`Unknown button id: ${button.id}`);
  });
};

addEventListener(
  "orientationchange",
  () => {
    location.reload();
  },
  false
);
