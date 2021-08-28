import { Player, Ease, IPlayerApp } from "textalive-app-api";

import { Nullable } from "./utils";
import { ThreeWrapper } from "./three";
import ControlPanel from "./controlPanel";

export const handlePlayer = ({
  player,
  three,
}: {
  player: Player;
  three: ThreeWrapper;
}) => ({
  handleOnAppReady: (app: IPlayerApp) => {
    if (!app.songUrl) {
      // デフォルト選択曲
      player.createFromSongUrl("https://piapro.jp/t/FDb1/20210213190029");
    }
  },
  handleOnVideoReady:
    (elements: {
      artist: Nullable<Element>;
      song: Nullable<Element>;
      word: Nullable<Element>;
      phrase: Nullable<Element>;
    }) =>
    () => {
      const { song } = player.data;
      if (elements.artist) {
        elements.artist.textContent = song.artist.name;
      }
      if (elements.song) {
        elements.song.textContent = song.name;
      }
      for (let word = player.video.firstWord; word; word = word.next) {
        word.animate = (now, u) => {
          if (u.contains(now) && elements.word) {
            elements.word.textContent = u.text;
          }
        };
      }
      three.resetTextMesh();
      for (
        let phrase = player.video.firstPhrase;
        phrase;
        phrase = phrase.next
      ) {
        three.addTextMesh(phrase.text);
        phrase.animate = (now, u) => {
          if (u.contains(now) && elements.phrase) {
            elements.phrase.textContent = u.text;
            three.showTextMeshToScene(u.text);
          }
        };
      }
    },
  handleOnTimerReady:
    (elements: {
      control: Nullable<HTMLElement>;
      word: Nullable<Element>;
      phrase: Nullable<Element>;
    }) =>
    () => {
      // ローディング表示の解除
      const spinner: HTMLElement | null = document.getElementById("loading");
      if (spinner) {
        spinner.classList.add("loaded");
      }

      player.video && player.requestPlay();
      ControlPanel.setMusicChangeFlg(false);

      if (player.app.managed || !elements.control) {
        // Hide controllers in 'TextAlive App Debugger'
        return;
      }

      elements.control.style.display = "none";
      elements.control.childNodes.forEach((button) => {
        if (button instanceof HTMLInputElement) {
          const songLengthMs = player.data.song.length * 1000;
          button.oninput = (ev) => {
            ev.preventDefault();
            if (elements.word) {
              elements.word.textContent = "-";
            }
            if (elements.phrase) {
              elements.phrase.textContent = "-";
              three.removeTextMeshFromScene();
            }
            const progress = parseFloat(button.value) / 100;
            player.video && player.requestMediaSeek(progress * songLengthMs);
          };
        }
        if (!(button instanceof HTMLButtonElement)) {
          return;
        }
        button.disabled = false;
        switch (button.id) {
          case "play":
            button.onclick = (ev) => {
              ev.preventDefault();
              player.video && player.requestPlay();
            };
            break;
          case "jump":
            button.disabled = !player.video.firstChar;
            button.onclick = (ev) => {
              ev.preventDefault();
              player.video &&
                player.requestMediaSeek(player.video.firstChar.startTime);
            };
            break;
          case "pause":
            button.onclick = (ev) => {
              ev.preventDefault();
              player.video && player.requestPause();
            };
            break;
          case "stop":
            button.onclick = (ev) => {
              ev.preventDefault();
              player.video && player.requestStop();
            };
            break;
        }
      });
    },
  handleOnTimeUpdate:
    (elements: {
      beats: Nullable<Element>;
      chords: Nullable<Element>;
      va: Nullable<Element>;
      amplitude: Nullable<Element>;
    }) =>
    (position: number) => {
      const beat = player.findBeat(position);
      if (beat && elements.beats) {
        const progress = Math.ceil(Ease.circIn(beat.progress(position)) * 100);
        elements.beats.textContent = `${beat.position} / ${beat.length} [${progress}%]`;
      }
      const chord = player.findChord(position);
      if (chord && elements.chords) {
        elements.chords.textContent = chord.name;
      }
      const va = player.getValenceArousal(position);
      if (va && elements.va) {
        elements.va.textContent = `${va.v} / ${va.a}`;
      }
      const amplitude = player.getVocalAmplitude(position);
      if (amplitude && elements.amplitude) {
        elements.amplitude.textContent = amplitude.toString();
      }
    },
  handleOnThrottledTimeUpdate:
    (elements: { position: Nullable<HTMLInputElement> }) =>
    (position: number) => {
      if (elements.position) {
        const songLengthMs = player.data.song.length * 1000;
        elements.position.value = String((position / songLengthMs) * 100);
      }
    },
  handleOnMediaSeek: (position: number) => {
    /** */
  },
  handleOnPlay: () => console.log("▶️ Start playing"),
  handleOnPause:
    (elements: { word: Nullable<Element>; phrase: Nullable<Element> }) =>
    () => {
      if (elements.word) {
        elements.word.textContent = "-";
      }
      if (elements.phrase) {
        elements.phrase.textContent = "-";
      }
    },
  handleOnStop:
    (elements: { word: Nullable<Element>; phrase: Nullable<Element> }) =>
    () => {
      if (elements.word) {
        elements.word.textContent = "-";
      }
      if (elements.phrase) {
        elements.phrase.textContent = "-";
        three.removeTextMeshFromScene();
      }
    },
});
