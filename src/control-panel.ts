import { Player } from "textalive-app-api";
import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

import { ThreeWrapper } from "./three";
import { safetyGetElementById, downloadDisplayCapture } from "./utils";
import { theme, paintSettings, musicList, twitter } from "./definition";
import PaintRenderer from "./paint/renderer";

enum PanelConfig {
  EXPANDED = "panel-expanded",
}

/**
 * コントロールパネル
 */
class ControlPanel {
  /** コントロールパネル本体 */
  private pane: Pane;
  /** textalive */
  private player: Player | null;
  /** 曲変更フラグ */
  private changeMusicFlg: boolean;
  /** カラーピッカーのパラメータ */
  private colorParam: { Color: string };
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
    const expanded =
      (localStorage.getItem(PanelConfig.EXPANDED) ?? "true") === "true";
    // コントロールパネルの生成
    this.pane = new Pane({
      title: "Menu",
      expanded,
    });
    this.player = null;
    this.changeMusicFlg = false;
    this.colorParam = { Color: theme.color.miku };
    this.eraserParam = { EraserMode: false };
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

    this.pane.on("fold", ({ expanded }) => {
      localStorage.setItem(PanelConfig.EXPANDED, expanded.toString());
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
        value: musicList[0]?.value,
        label: "Songs",
      })
      .on("change", (ev) => {
        // 曲の停止
        player.requestStop();
        player.createFromSongUrl(ev.value);
        this.changeMusicFlg = true;
        // ローディングの表示
        safetyGetElementById("loading").classList.remove("loaded");
      });

    // セパレータの追加
    tab.pages[0]?.addSeparator();

    tab.pages[0]
      ?.addBlade({
        view: "buttongrid",
        size: [4, 1],
        cells: (x: number, y: number) => ({
          title: [["Play", "Pause", "Stop", "Jump"]][y]?.[x],
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
          Volume: player.volume,
        },
        "Volume",
        {
          step: 1,
          min: 0,
          max: 100,
        }
      )
      .on("change", (ev) => {
        player.volume = Math.round(ev.value);
      });

    tab.pages[1]
      ?.addInput(
        {
          LineWidth: paintSettings.lineWidth,
        },
        "LineWidth",
        {
          step: 0.5,
          min: 0.5,
          max: 100,
        }
      )
      .on("change", (ev) => {
        paintRenderer.setLineWidth(ev.value);
      });

    tab.pages[1]?.addInput(this.colorParam, "Color").on("change", (ev) => {
      if (this.eraserParam.EraserMode) {
        paintRenderer.setPrevLineColor(ev.value);
      } else {
        paintRenderer.setLineColor(ev.value);
      }
    });

    tab.pages[1]
      ?.addInput(this.eraserParam, "EraserMode")
      .on("change", (ev) => {
        if (ev.value) {
          paintRenderer.setLineColor(theme.color.blackboard);
        } else {
          paintRenderer.setLineColor(this.colorParam.Color);
        }
      });

    // セパレータの追加
    tab.pages[1]?.addSeparator();

    tab.pages[1]
      ?.addButton({
        title: "Clear Black Board",
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
   * 曲変更フラグの取得
   * @returns {boolean} this.changeMusicFlg
   */
  public getMusicChangeFlg(): boolean {
    return this.changeMusicFlg;
  }

  /**
   * 曲変更フラグの設定
   * @param {boolean} flg 曲変更フラグ
   */
  public setMusicChangeFlg(flg: boolean): void {
    this.changeMusicFlg = flg;
  }

  /**
   * カラーピッカーの色変更
   * @param {string} color カラーコード
   */
  public changeColorPicker(color: string): void {
    this.colorParam.Color = color;
    // UIの反映
    this.pane?.refresh();
  }

  /**
   * 消しゴムモードの切り替え
   */
  public toggleEraserMode(): void {
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
    const second = position / 1000;
    this.seekParam.Time = Number(second.toFixed(2));
    this.pane.refresh();
  }
}
export default new ControlPanel();
