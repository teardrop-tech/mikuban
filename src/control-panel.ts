import { Player } from "textalive-app-api";
import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

import { safetyGetElementById } from "./utils";
import Paint from "./paint";
import { theme, musicList } from "./definition";

/**
 * コントロールパネル
 */
class ControlPanel {
  /** コントロールパネル本体 */
  private pane: Pane;
  /** 曲変更フラグ */
  private changeMusicFlg = false;
  /** カラーピッカーのパラメータ */
  private COLOR = {
    Color: Paint.getLineColor(),
  };
  /** 消しゴムモードのパラメータ */
  private ERASER = {
    EraserMode: false,
  };

  /**
   * コンストラクタ
   */
  constructor() {
    // コントロールパネルの生成
    this.pane = new Pane({
      title: "Control Panel",
      expanded: false,
    });
  }

  /**
   * 初期化
   * @param {Player} player TextAlive Player
   */
  public init(player: Player): void {
    this.pane.registerPlugin(EssentialsPlugin);

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

    /** ペイント関連 */
    tab.pages[1]
      ?.addBlade({
        view: "slider",
        label: "Line Weight",
        min: 0.5,
        max: 100,
        value: Paint.getLineBold(),
      })
      .on("change", (ev) => {
        Paint.setLineBold(ev.value);
      });

    tab.pages[1]?.addInput(this.COLOR, "Color").on("change", (ev) => {
      if (this.ERASER.EraserMode) {
        Paint.setPrevLineColor(ev.value);
      } else {
        Paint.setLineColor(ev.value);
      }
    });

    tab.pages[1]?.addInput(this.ERASER, "EraserMode").on("change", (ev) => {
      if (ev.value) {
        Paint.setLineColor(theme.color.blackboard);
      } else {
        Paint.changePrevColor();
      }
    });

    tab.pages[1]
      ?.addButton({
        title: "Clear Black Board",
      })
      .on("click", () => {
        Paint.clearCanvas();
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
    this.COLOR.Color = color;
    // UIの反映
    this.pane?.refresh();
  }

  /**
   * 消しゴムモードの切り替え
   */
  public toggleEraserMode(): void {
    this.ERASER.EraserMode = !this.ERASER.EraserMode;
    // UIの反映
    this.pane?.refresh();
  }
}
export default new ControlPanel();
