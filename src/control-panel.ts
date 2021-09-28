import { Player } from "textalive-app-api";
import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

import { ThreeWrapper } from "./three";
import { safetyGetElementById, downloadDisplayCapture } from "./utils";
import {
  theme,
  paintSettings,
  musicList,
  twitter,
  defaultMusic,
} from "./definition";
import PaintRenderer from "./paint/renderer";
import LyricsRenderer from "./lyrics/renderer";

export enum PanelConfig {
  EXPANDED = "panel-expanded",
  VOLUME = "panel-volume",
  MUSIC = "panel-music",
  LINE_WIDTH = "panel-line-bold",
  LINE_COLOR = "panel-line-color",
  LYRICS_SIZE = "panel-lyrics-size",
  LYRICS_COLOR = "panel-lyrics-color",
}

export const loadConfigValue = (key: PanelConfig): string => {
  switch (key) {
    case PanelConfig.EXPANDED:
      return localStorage.getItem(key) || "true";
    case PanelConfig.VOLUME:
      return localStorage.getItem(key) || "100";
    case PanelConfig.MUSIC:
      return localStorage.getItem(key) || defaultMusic.value;
    case PanelConfig.LINE_WIDTH:
      return localStorage.getItem(key) || paintSettings.lineWidth.toString();
    case PanelConfig.LINE_COLOR:
      return localStorage.getItem(key) || theme.color.miku;
    case PanelConfig.LYRICS_SIZE:
      return localStorage.getItem(key) || "1";
    case PanelConfig.LYRICS_COLOR:
      return localStorage.getItem(key) || theme.color.white;
    default:
      throw Error("Unknown config: " + key);
  }
};

export const saveConfigValue = (key: PanelConfig, value: string): void => {
  switch (key) {
    case PanelConfig.EXPANDED:
    case PanelConfig.VOLUME:
    case PanelConfig.MUSIC:
    case PanelConfig.LINE_WIDTH:
    case PanelConfig.LINE_COLOR:
    case PanelConfig.LYRICS_SIZE:
    case PanelConfig.LYRICS_COLOR:
      return localStorage.setItem(key, value);
    default:
      throw Error("Unknown config: " + key);
  }
};

/**
 * コントロールパネル
 */
class ControlPanel {
  /** コントロールパネル本体 */
  private pane: Pane;
  /** textalive */
  private player: Player | null;
  /** 現在選択中のタブ  */
  private currentTabIndex: number;
  /** カラーピッカーのパラメータ */
  private colorParam: { LineColor: string; LyricsColor: string };
  /** 消しゴムモードのパラメータ */
  private eraserParam: { EraserMode: boolean };
  /** シークバーのパラメータ */
  private seekParam: { Time: number };
  /** シーク中かどうか */
  private isSeeking: boolean;

  /**
   * コンストラクタ
   */
  constructor() {
    const expanded = loadConfigValue(PanelConfig.EXPANDED) === "true";
    // コントロールパネルの生成
    this.pane = new Pane({
      title: "Menu",
      expanded,
    });
    this.player = null;
    this.currentTabIndex = 0;
    this.colorParam = {
      LineColor: loadConfigValue(PanelConfig.LINE_COLOR),
      LyricsColor: loadConfigValue(PanelConfig.LYRICS_COLOR),
    };
    this.eraserParam = {
      EraserMode: false,
    };
    this.seekParam = { Time: 0 };
    this.isSeeking = false;
  }

  /**
   * 初期化
   * @param {Player} player TextAlive Player
   * @param {ThreeWrapper} threeWrapper ThreeWrapper
   */
  public init(player: Player, { scene, camera, canvas }: ThreeWrapper): void {
    this.player = player;

    this.pane.registerPlugin(EssentialsPlugin);

    const paintRenderer = PaintRenderer({
      scene,
      camera,
      canvas,
    });

    const lyricsRenderer = LyricsRenderer({
      scene,
    });

    this.pane.on("fold", ({ expanded }) => {
      saveConfigValue(PanelConfig.EXPANDED, expanded.toString());
    });

    // タブの追加
    const tab = this.pane.addTab({
      pages: [{ title: "Music" }, { title: "Paint" }],
    });

    // セパレータの追加
    tab.pages[0]?.addSeparator();

    // 曲選択リストの追加
    tab.pages[0]
      ?.addBlade({
        view: "list",
        options: musicList,
        value: loadConfigValue(PanelConfig.MUSIC),
        label: "Songs",
      })
      .on("change", (ev) => {
        // 曲の停止
        player.requestStop();
        player.createFromSongUrl(ev.value);
        saveConfigValue(PanelConfig.MUSIC, ev.value);
        // ローディングの表示
        safetyGetElementById("loading").classList.remove("loaded");
      });

    // セパレータの追加
    tab.pages[0]?.addSeparator();

    tab.pages[0]
      ?.addBlade({
        view: "buttongrid",
        size: [3, 1],
        cells: (x: number, y: number) => ({
          title: [["Play", "Pause", "Stop"]][y]?.[x],
        }),
      })
      .on("click", (ev) => {
        switch (ev.cell.title) {
          case "Play":
            player.requestPlay();
            break;
          case "Pause":
            player.requestPause();
            break;
          case "Stop":
            player.requestStop();
            break;
          case "Jump":
            player.requestMediaSeek(player.video.firstChar.startTime);
            break;
          default:
            throw new Error(`Unknown event type: ${ev.cell.title}`);
        }
      });

    tab.pages[0]
      ?.addInput(
        {
          Volume: Number(loadConfigValue(PanelConfig.VOLUME)),
        },
        "Volume",
        {
          step: 1,
          min: 0,
          max: 100,
        }
      )
      .on("change", (ev) => {
        const volume = Math.round(Number(ev.value));
        player.volume = volume;
        saveConfigValue(PanelConfig.VOLUME, volume.toString());
      });

    tab.pages[1]?.addInput(this.colorParam, "LineColor").on("change", (ev) => {
      if (this.eraserParam.EraserMode) {
        paintRenderer.setPrevLineColor(ev.value);
      } else {
        saveConfigValue(PanelConfig.LINE_COLOR, ev.value);
        paintRenderer.setLineColor(ev.value);
      }
    });

    tab.pages[1]
      ?.addInput(this.colorParam, "LyricsColor")
      .on("change", (ev) => {
        saveConfigValue(PanelConfig.LYRICS_COLOR, ev.value);
        lyricsRenderer.setColor(ev.value);
      });

    tab.pages[1]
      ?.addInput(this.eraserParam, "EraserMode")
      .on("change", (ev) => {
        if (ev.value) {
          paintRenderer.setLineColor(theme.color.blackboard);
          // HACK
          const eraser = safetyGetElementById("eraser");
          eraser.style.borderStyle = "dashed";
          eraser.style.borderColor = "red";
          eraser.style.borderWidth = "4px";
          const cursor = safetyGetElementById("three");
          cursor.style.cursor = "url(../icon/eraser-fill.png), auto";
        } else {
          paintRenderer.setLineColor(this.colorParam.LineColor);
          // HACK
          const eraser = safetyGetElementById("eraser");
          eraser.style.borderStyle = "";
          eraser.style.borderColor = "";
          eraser.style.borderWidth = "";
          const cursor = safetyGetElementById("three");
          cursor.style.cursor = "url(../icon/pencil-line.png), auto";
        }
      });

    tab.pages[1]
      ?.addInput(
        {
          LineWidth: Number(loadConfigValue(PanelConfig.LINE_WIDTH)),
        },
        "LineWidth",
        {
          step: 0.5,
          min: 0.5,
          max: 100,
        }
      )
      .on("change", (ev) => {
        saveConfigValue(PanelConfig.LINE_WIDTH, ev.value.toString());
        paintRenderer.setLineWidth(ev.value);
      });

    // TODO: LyricsSize
    // tab.pages[1]
    //   ?.addInput(
    //     {
    //       LyricsSize: Number(loadConfigValue(PanelConfig.LYRICS_SIZE)),
    //     },
    //     "LyricsSize",
    //     {
    //       step: 1,
    //       min: 1,
    //       max: 100,
    //     }
    //   )
    //   .on("change", (ev) => {
    //     const size = Math.round(Number(ev.value));
    //     saveConfigValue(PanelConfig.LYRICS_SIZE, size.toString());
    //     lyricsRenderer.setFontSize(size);
    //   });

    // セパレータの追加
    tab.pages[1]?.addSeparator();

    tab.pages[1]
      ?.addButton({
        title: "Clear Paint",
      })
      .on("click", () => {
        paintRenderer.clearPaintMesh();
      });

    // セパレータの追加
    tab.pages[1]?.addSeparator();

    tab.pages[1]
      ?.addButton({
        title: "Screenshot",
      })
      .on("click", () => {
        downloadDisplayCapture();
      });

    // セパレータの追加
    tab.pages[1]?.addSeparator();

    tab.pages[1]
      ?.addButton({
        title: "Tweet",
      })
      .on("click", () => {
        open(twitter.toURL());
      });
  }

  /**
   * 現在選択中のタブの設定
   * @param {number} index タブインデックス
   */
  public setCurrentTabIndex(index: number): void {
    this.currentTabIndex = index;
  }

  /**
   * カラーピッカーの色変更
   * @param {string} color カラーコード
   */
  public changeColorPicker(color: string): void {
    this.colorParam.LineColor = color;
    // UIの反映
    this.pane?.refresh();
  }

  /**
   * 消しゴムモードに切り替え
   */
  public onEraserMode(): void {
    this.eraserParam.EraserMode = !this.eraserParam.EraserMode;
    // UIの反映
    this.pane?.refresh();
  }

  /**
   * シークバーの初期化
   * @param {number} length 楽曲の再生時間[s]
   */
  public initSeekBar(length: number): void {
    this.isSeeking = false;

    const tab = this.pane.children[0];
    const musicPage = tab?.pages[0];

    let seekBar = musicPage.children[5];

    if (seekBar) {
      tab?.pages[0]?.remove(seekBar);
    }

    seekBar = tab?.pages[0]
      ?.addInput(this.seekParam, "Time", {
        min: 0,
        max: length,
      })
      .on("change", (ev: any) => {
        if (ev.last) {
          if (this.isSeeking) {
            this.player?.requestMediaSeek(ev.value * 1000);
            setTimeout(() => {
              this.isSeeking = false;
            }, 100);
          }
        } else {
          this.isSeeking = true;
          this.pane.refresh();
        }
      });
  }

  /**
   * シークバーの更新
   * @param {number} position 現在の再生位置[ms]
   */
  public updateSeekBar(position: number): void {
    if (this.isSeeking) return;
    if (this.currentTabIndex === 1) return;
    const second = position / 1000;
    this.seekParam.Time = Number(second.toFixed(2));
    this.pane.refresh();
  }
}
export default new ControlPanel();
