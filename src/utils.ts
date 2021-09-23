import { theme, disclaimer } from "./definition";
import html2canvas from "html2canvas";

export const safetyGetElementById = (id: string): HTMLElement => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element not found: ${id}`);
  }
  return element;
};

/**
 * テーマに含まれる色IDか
 */
export const isThemeColorId = (id: string): id is keyof typeof theme.color =>
  id in theme.color;

/**
 * 画面全体の画像をダウンロード
 */
export const downloadDisplayCapture = (): void => {
  if (!confirm(disclaimer)) {
    return;
  }
  html2canvas(safetyGetElementById("capture")).then((canvas) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      document.body.appendChild(link);
      link.download = "mikuban.png";
      link.href = url;
      link.click();
      link.remove();
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1e4);
    }, "image/png");
  });
};
