import { Player } from "textalive-app-api";

window.onload = () => {
  const player = new Player({
    app: {
      token: process.env.TOKEN ?? "",
    },
  });
  player.addListener({
    onVideoReady: (v) => {
      let w = player.video.firstWord;
      while (w) {
        w.animate = (now, unit) => console.log(`Vocal: ${unit.text}`);
        w = w.next;
      }
    },
    onAppReady: (app) => {
      console.log(app);
      if (!app.songUrl) {
        player.createFromSongUrl("http://www.youtube.com/watch?v=Ch4RQPG1Tmo");
      }
    },
  });
};
