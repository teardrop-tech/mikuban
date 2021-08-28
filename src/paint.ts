/**
 * お絵かき機能
 */

/** 描画可能領域 */
const DRAW_OFFSET_X = 25;
const DRAW_OFFSET_Y = 25;

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
  /** 線の色 */
  private color = "#66DDCC";
  /** 前回の線の色 */
  private prevColor = this.color;
  /** 線の太さ */
  private bold = 10;

  /**
   * コンストラクタ
   */
  constructor() {
    console.log("Paint Constructor");
  }

  /**
   * 描画可能かどうか
   * @param {number} x 描画位置のX座標
   * @param {number} y 描画位置のY座標
   * @returns true:描画可能 false:描画不可能
   */
  private canDraw(x: number, y: number): boolean {
    if (x >= DRAW_OFFSET_X && x < this.width - DRAW_OFFSET_X) {
      if (y >= DRAW_OFFSET_Y && y < this.height - DRAW_OFFSET_Y) {
        return true;
      }
    }
    return false;
  }

  /**
   * 線の描画
   * @param {number} x X座標
   * @param {number} y Y座標
   */
  private draw(x: number, y: number): void {
    if (!this.context) return;

    // 線の色の設定
    this.context.strokeStyle = this.color;
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
      if (!this.canDraw(e.offsetX, e.offsetY)) return;
      this.draw(e.offsetX, e.offsetY);
    });

    this.canvas.addEventListener("mouseup", (e) => {
      this.clickFlg = 0;
      if (!this.canDraw(e.offsetX, e.offsetY)) return;
      this.draw(e.offsetX, e.offsetY);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.clickFlg) return false;
      if (!this.canDraw(e.offsetX, e.offsetY)) return;
      this.draw(e.offsetX, e.offsetY);
    });

    this.canvas.addEventListener("mouseout", () => {
      this.clickFlg = 0;
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
        const touchX = touch.clientX - this.canvas.getBoundingClientRect().left;
        const touchY = touch.clientY - this.canvas.getBoundingClientRect().top;
        if (!this.canDraw(touchX, touchY)) return;
        this.draw(touchX, touchY);
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

  /**
   * 線の太さを設定
   * @param {number} bold 線の太さ
   */
  public setLineBold(bold: number): void {
    this.bold = bold;
  }

  public getLineBold = () => this.bold;

  /**
   * 線の色を設定
   * @param {string} color 色
   */
  public setLineColor(color: string): void {
    // 前回の色を保持
    this.prevColor = this.color;
    this.color = color;
  }

  public getLineColor = () => this.color;

  /**
   * 前回設定されていた色に変更
   */
  public changePrevColor(): void {
    this.color = this.prevColor;
  }

  /**
   * キャンバスクリア
   */
  public clearCanvas(): void {
    if (!this.context) return;
    this.context.clearRect(0, 0, this.width, this.height);
  }
}
export default new Paint();
