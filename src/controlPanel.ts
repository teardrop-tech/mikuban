import { Player } from "textalive-app-api";
import { FolderApi, Pane, TabApi } from "tweakpane";
import Paint from "./paint";

/**
 * コントロールパネル
 */
class ControlPanel {
  /** TextAlive Player */
  private player: Player | null | undefined;
  /** コントロールパネル */
  private pane: Pane | null | undefined;
  /** タブ */
  private tab: TabApi | null | undefined;
  /** メディアコントロールのフォルダー */
  private mediaFolder: FolderApi | null | undefined;
  /** 曲変更フラグ */
  private changeMusicFlg = false;
  /** カラーピッカーのパラメータ */
  private COLOR = {
    Color: Paint.getLineColor(),
  };

  constructor() {
    console.log("ControlPanel constructor");
  }

  /**
   * 初期化
   * @param {Player} player TextAlive Player
   */
  public init(player: Player): void {
    this.player = player;

    // コントロールパネルの生成
    this.pane = new Pane({
      title: "Control Panel",
      expanded: false,
    });

    // タブの追加
    this.tab = this.pane.addTab({
      pages: [{ title: "Music" }, { title: "Paint" }],
    });

    // イベント設定
    this.pane.on("change", (ev) => {
      if (!this.player) return;

      // 曲の音量変更
      if (ev.presetKey === "Volume") {
        if (typeof ev.value === "number") {
          this.player.volume = ev.value;
        }
        return;
      }

      // 線の太さを設定
      if (ev.presetKey === "LineWeight") {
        if (typeof ev.value === "number") {
          Paint.setLineBold(ev.value);
        }
        return;
      }

      // 線の色を変更
      if (ev.presetKey === "Color") {
        if (typeof ev.value === "string") {
          Paint.setLineColor(ev.value);
        }
        return;
      }

      // 消しゴムモードに変更
      if (ev.presetKey === "EraserMode") {
        if (ev.value) {
          Paint.setLineColor("#3d5347");
        } else {
          Paint.changePrevColor();
        }
        return;
      }

      // 曲変更
      if (typeof ev.value === "string") {
        // 曲の停止
        this.player.video && this.player.requestStop();
        this.player.createFromSongUrl(ev.value);
        this.changeMusicFlg = true;
        // ローディングの表示
        const spinner = document.getElementById("loading");
        spinner?.classList.remove("loaded");
        return;
      }
    });

    // セパレータの追加
    this.tab.pages[0]?.addSeparator();

    // 曲選択リストの追加
    this.tab.pages[0]?.addBlade({
      view: "list",
      label: "Music Select",
      options: [
        {
          text: "First Note / blues",
          value: "https://piapro.jp/t/FDb1/20210213190029",
        },
        {
          text: "嘘も本当も君だから / 真島ゆろ",
          value: "https://piapro.jp/t/YW_d/20210206123357",
        },
        {
          text: "その心に灯る色は / ラテルネ",
          value: "https://www.youtube.com/watch?v=bMtYf3R0zhY",
        },
        {
          text: "夏をなぞって / シロクマ消しゴム",
          value: "https://piapro.jp/t/R6EN/20210222075543",
        },
        {
          text: "密かなる交信曲 / 濁茶",
          value: "https://www.youtube.com/watch?v=Ch4RQPG1Tmo",
        },
        {
          text: "Freedom! / Chiquewa",
          value: "https://piapro.jp/t/N--x/20210204215604",
        },
      ],
      value: "https://piapro.jp/t/FDb1/20210213190029",
    });

    // セパレータの追加
    this.tab.pages[0]?.addSeparator();

    this.mediaFolder = this.tab.pages[0]?.addFolder({
      title: "Media Controls",
    });
    const startBtn = this.mediaFolder?.addButton({
      title: "Start",
    });
    if (startBtn) {
      startBtn.on("click", () => {
        if (!this.player) return;
        this.player.video && this.player.requestPlay();
      });
    }

    const pauseBtn = this.mediaFolder?.addButton({
      title: "Pause",
    });
    if (pauseBtn) {
      pauseBtn.on("click", () => {
        if (!this.player) return;
        player.video && player.requestPause();
      });
    }

    const stopBtn = this.mediaFolder?.addButton({
      title: "Stop",
    });
    if (stopBtn) {
      stopBtn.on("click", () => {
        if (!this.player) return;
        player.video && player.requestStop();
      });
    }

    const VOLUME = {
      Volume: this.player.volume,
    };
    this.mediaFolder?.addInput(VOLUME, "Volume", {
      min: 0,
      max: 100,
    });

    /** ペイント関連 */
    const LINE_WEIGHT = {
      LineWeight: Paint.getLineBold(),
    };
    this.tab.pages[1]?.addInput(LINE_WEIGHT, "LineWeight", {
      min: 0.5,
      max: 100,
    });

    this.tab.pages[1]?.addInput(this.COLOR, "Color");

    const ERASER = {
      EraserMode: false,
    };
    this.tab.pages[1]?.addInput(ERASER, "EraserMode");

    const clearBtn = this.tab.pages[1]?.addButton({
      title: "Clear Black Board",
    });
    if (clearBtn) {
      clearBtn.on("click", () => {
        if (!this.player) return;
        Paint.clearCanvas();
      });
    }
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
}
export default new ControlPanel();
