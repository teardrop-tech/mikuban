import { setupThree } from "./three";
import { initializePlayer } from "./textalive";
import { safetyGetElementById } from "./utils";
import ControlPanel from "./control-panel";
import preloadFont from "./font-loader";
import { initChalkButtons } from "./paint";
import Validate from "./validator";

window.onload = async () => {
  addEventListener("orientationchange", () => location.reload(), false);

  try {
    await Validate();
  } catch {
    // Blackout
    document.body.style.backgroundColor = "black";
    document.body.innerHTML = "";
    return;
  }

  if (process.env.DEBUG) {
    safetyGetElementById("debug").style.display = "block";
  }

  const three = setupThree();

  const fontLoader = preloadFont();

  const player = initializePlayer({
    scene: three.scene,
    token: process.env.TOKEN ?? "",
    fontLoader,
  });

  // コントロールパネルの表示
  ControlPanel.init(player, three);

  // HACK: コントロールパネルのタブ情報
  const tab = document.getElementsByClassName("tp-tbiv_b");
  const tabs = Array.from(tab);
  let index = 0;
  tabs.forEach((element) => {
    element.id = "tab-id-" + index.toString();
    ++index;
  });
  const tab1 = safetyGetElementById("tab-id-0");
  tab1.addEventListener("click", () => {
    ControlPanel.setCurrentTabIndex(0);
  });
  const tab2 = safetyGetElementById("tab-id-1");
  tab2.addEventListener("click", () => {
    ControlPanel.setCurrentTabIndex(1);
  });

  // チョーク&黒板消しボタンの初期化
  initChalkButtons();

  three.play();
};
