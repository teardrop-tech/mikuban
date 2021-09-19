// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { preloadFont } from "troika-three-text";

export const font = "YuseiMagic-Regular.otf";

export default () =>
  new Promise<void>((resolve) => preloadFont({ font }, resolve));
