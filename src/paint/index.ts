import { isThemeColorId, safetyGetElementById } from "../utils";
import { theme } from "../definition";
import ControlPanel from "../control-panel";

/**
 * チョークボタンの初期化
 */
export const initChalkButtons = () => {
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
