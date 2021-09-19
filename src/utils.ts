import { theme } from "./definition";

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
