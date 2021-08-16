import { Player } from "textalive-app-api";
import { Pane } from "tweakpane";

/**
 * コントロールパネル
 */
class ControlPanel {
  /** TextAlive Player */
  private player: Player | null | undefined;

  constructor() {
    console.log("ControlPanel Constructor");
  }

  /**
   * 初期化
   * @param {Player} player TextAlive Player
   */
  public init(player: Player): void {
    this.player = player;

    const pane = new Pane();
    const btn = pane.addButton({
      title: "Start",
      label: "再生",
    });
    btn.on("click", () => {
      if (!this.player) return;
      this.player.video && this.player.requestPlay();
      console.log("Start playing");
    });
  }
}
export default new ControlPanel();
