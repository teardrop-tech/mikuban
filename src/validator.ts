import { detect } from "detect-browser";

export default (): Promise<void> =>
  new Promise((resolve, reject) => {
    // Validate browser
    const browser = detect();
    switch (browser?.name) {
      case "ie": {
        alert("Internet Explorer is not supported!");
        reject();
        break;
      }
      default:
        break;
    }

    // Validate orientation
    if (innerHeight > innerWidth) {
      alert(
        "デバイスを横画面にしてください (＞人＜;)\nPlease use landscape 🙏"
      );
      reject();
    }

    // Finish validation
    resolve();
  });
