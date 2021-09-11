import { setupThree, ThreeWrapper } from "./three";
import { initializePlayer } from "./textalive";
import { safetyGetElementById } from "./utils";
import { theme } from "./definition";
import Paint from "./paint";
import ControlPanel from "./control-panel";

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

  // 黒板消しボタンの初期化
  initEraserButton();

  // チョークボタンの初期化
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
  // paint canvasのリサイズ
  Paint.setCanvasSize(width, height);
};

/**
 * 黒板消しボタンの初期化
 */
const initEraserButton = () => {
  const button = safetyGetElementById("eraser");
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.disabled = false;

  button.onclick = (ev) => {
    ev.preventDefault();
    ControlPanel.toggleEraserMode();
  };
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

    switch (button.id) {
      case "chalk-white":
        button.onclick = (ev) => {
          ev.preventDefault();
          ControlPanel.changeColorPicker(theme.color.white);
        };
        break;
      case "chalk-miku":
        button.onclick = (ev) => {
          ev.preventDefault();
          ControlPanel.changeColorPicker(theme.color.miku);
        };
        break;
      case "chalk-rin":
        button.onclick = (ev) => {
          ev.preventDefault();
          ControlPanel.changeColorPicker(theme.color.rin);
        };
        break;
      case "chalk-ren":
        button.onclick = (ev) => {
          ev.preventDefault();
          ControlPanel.changeColorPicker(theme.color.ren);
        };
        break;
      case "chalk-luka":
        button.onclick = (ev) => {
          ev.preventDefault();
          ControlPanel.changeColorPicker(theme.color.luka);
        };
        break;
      case "chalk-kaito":
        button.onclick = (ev) => {
          ev.preventDefault();
          ControlPanel.changeColorPicker(theme.color.kaito);
        };
        break;
      case "chalk-meiko":
        button.onclick = (ev) => {
          ev.preventDefault();
          ControlPanel.changeColorPicker(theme.color.meiko);
        };
        break;
      default:
        throw new Error(`Unknown button id: ${button.id}`);
    }
  });
};
