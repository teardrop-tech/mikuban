import { theme } from "./definition";
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

export const toVertical = (text: string) => text.split("").join("\n");

export const toVerticalDate = (cal: Date) => {
  const month = cal.getMonth() + 1;
  const date = cal.getDate();
  const day = ((d) => {
    switch (d) {
      case 0:
        return "日";
      case 1:
        return "月";
      case 2:
        return "火";
      case 3:
        return "水";
      case 4:
        return "木";
      case 5:
        return "金";
      case 6:
        return "土";
    }
  })(cal.getDay());
  return [month, "月", date, "日", day, "曜", "日"].join("\n");
};

/**
 * 画面全体の画像をダウンロード
 */
export const downloadDisplayCapture = (): void => {
  const element = document?.querySelector("#capture") as HTMLElement;
  html2canvas(element).then((canvas) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = "miku_ban";
    link.click();
  });
};
