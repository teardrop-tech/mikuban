/**
 * お絵かき機能
 */
class Paint {
  /** HTML canvas */
  private canvas: HTMLCanvasElement | null | undefined;
  /** コンテキスト */
  private context: CanvasRenderingContext2D | null | undefined;
  /** canvasの幅 */
  private width = 0;
  /** canvasの高さ */
  private height = 0;
  /** クリック中の判定1:クリック開始 2:クリック中 */
  private clickFlg = 0;
  /** 線の色(R、G、B、α) */
  private color = "255, 0, 0, 1";
  /** 線の太さ */
  private bold = 5;

  /**
   * コンストラクタ
   */
  constructor() {
    console.log("Paint Constructor");
  }

  /**
   * 線の描画
   * @param {number} x X座標
   * @param {number} y Y座標
   */
  private draw(x: number, y: number): void {
    if (!this.context) return;

    // 線の色の設定
    this.context.strokeStyle = "rgba(" + this.color + ")";
    // 線の太さの設定
    this.context.lineWidth = this.bold;
    // 描画
    if (this.clickFlg == 1) {
      this.clickFlg = 2;
      this.context.beginPath();
      this.context.lineCap = "round";
      this.context.moveTo(x, y);
    } else {
      this.context.lineTo(x, y);
    }
    this.context.stroke();
  }

  /**
   * 初期化(DOM構築後に呼び出すこと)
   */
  public init(): void {
    // canvasを取得
    this.canvas = document.querySelector("#paint") as HTMLCanvasElement;
    // コンテキストの取得
    this.context = this.canvas.getContext("2d");
    // 幅と高さの設定
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    this.setCanvasSize(width, height);

    this.canvas.addEventListener("mousedown", (e) => {
      this.clickFlg = 1;
      this.draw(e.offsetX, e.offsetY);
    });

    this.canvas.addEventListener("mouseup", (e) => {
      this.clickFlg = 0;
      this.draw(e.offsetX, e.offsetY);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.clickFlg) return false;
      this.draw(e.offsetX, e.offsetY);
    });

    this.canvas.addEventListener("touchstart", () => {
      this.clickFlg = 1;
    });

    this.canvas.addEventListener("touchend", () => {
      this.clickFlg = 0;
    });

    this.canvas.addEventListener("touchmove", (e) => {
      if (!this.clickFlg) return false;
      if (!this.canvas) return false;

      const touchList: TouchList = e.changedTouches;
      const touch: Touch | undefined = touchList[0];

      // ファーストタッチのみ処理
      if (touch) {
        this.draw(
          touch.clientX - this.canvas.getBoundingClientRect().left,
          touch.clientY - this.canvas.getBoundingClientRect().top
        );
      }
    });
  }

  /**
   * canvasサイズの設定
   * @param {number} width 幅
   * @param {number} height 高さ
   */
  public setCanvasSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }
}
export default new Paint();
