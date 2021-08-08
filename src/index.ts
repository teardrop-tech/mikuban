import { Player, Ease, IPlayerApp } from "textalive-app-api";
import * as THREE from "three";

import { TTFLoader } from "./loader/ttf-loader";

type Nullable<T> = T | null;

const handlePlayer = ({
  player,
  three,
}: {
  player: Player;
  three: ThreeWrapper;
}) => ({
  handleOnAppReady: (app: IPlayerApp) => {
    if (!app.songUrl) {
      player.createFromSongUrl("http://www.youtube.com/watch?v=Ch4RQPG1Tmo");
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
        for (
          let phrase = player.video.firstPhrase;
          phrase;
          phrase = phrase.next
        ) {
          phrase.animate = (now, u) => {
            if (u.contains(now) && elements.phrase) {
              elements.phrase.textContent = u.text;
              three.updateText(u.text);
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
        if (player.app.managed || !elements.control) {
          // Hide controllers in 'TextAlive App Debugger'
          return;
        }
        elements.control.style.display = "block";
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
                three.updateText();
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
  handleOnMediaSeek: () => (position: number) =>
    console.log(`🏃‍♂️ Change seek to ${position} ms`),
  handleOnPlay: () => console.log("▶️ Start playing"),
  handleOnPause:
    (elements: { word: Nullable<Element>; phrase: Nullable<Element> }) =>
      () => {
        if (elements.word) {
          elements.word.textContent = "-";
        }
        if (elements.phrase) {
          elements.phrase.textContent = "-";
          three.updateText();
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
          three.updateText();
        }
      },
});

interface ThreeWrapper {
  scene: THREE.Scene;
  font: THREE.Font;
  play: () => void;
  updateText: (text?: string) => void;
}

const setupThree = (): Promise<ThreeWrapper> =>
  new Promise((resolve) => {
    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#three") as HTMLCanvasElement,
    });
    renderer.setClearColor(0x3d5347, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(640, 380);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 640 / 380);
    camera.position.set(50, -100, 300);
    camera.lookAt(scene.position);
    scene.add(new THREE.AxesHelper(1000));
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(40, 40, 40),
      new THREE.MeshNormalMaterial()
    );
    scene.add(box);
    const loader = new TTFLoader();
    loader.load("./public/TanukiMagic.ttf", (json: any) => {
      const font = new THREE.FontLoader().parse(json);
      let mesh: THREE.Mesh;
      resolve({
        scene,
        font,
        play: tick,
        updateText: (text = "みなとみらい") => {
          mesh && scene.remove(mesh);
          mesh = new THREE.Mesh(
            new THREE.TextGeometry(text, {
              font,
              size: 40,
              height: 3,
              curveSegments: 12,
            }).center(),
            new THREE.MeshLambertMaterial({ color: 0xffffff })
          );
          scene.add(mesh);
        },
      });
    });
    const tick = () => {
      box.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };
  });

window.onload = async () => {
  const three = await setupThree();

  const player = new Player({
    app: {
      token: process.env.TOKEN ?? "",
    },
    valenceArousalEnabled: true,
    vocalAmplitudeEnabled: true,
  });

  const {
    handleOnAppReady: onAppReady,
    handleOnVideoReady,
    handleOnTimerReady,
    handleOnTimeUpdate,
    handleOnThrottledTimeUpdate,
    handleOnMediaSeek: onMediaSeek,
    handleOnPlay: onPlay,
    handleOnPause,
    handleOnStop,
  } = handlePlayer({
    player,
    three,
  });
  const onVideoReady = handleOnVideoReady({
    artist: document.querySelector("#artist span"),
    song: document.querySelector("#song span"),
    word: document.querySelector("#text"),
    phrase: document.querySelector("#phrase"),
  });
  const onTimerReady = handleOnTimerReady({
    control: document.querySelector("#control"),
    word: document.querySelector("#text"),
    phrase: document.querySelector("#phrase"),
  });
  const onTimeUpdate = handleOnTimeUpdate({
    beats: document.querySelector("#beats"),
    chords: document.querySelector("#chords"),
    va: document.querySelector("#va"),
    amplitude: document.querySelector("#amplitude"),
  });
  const onThrottledTimeUpdate = handleOnThrottledTimeUpdate({
    position: document.querySelector("#position"),
  });
  const onPause = handleOnPause({
    word: document.querySelector("#text"),
    phrase: document.querySelector("#phrase"),
  });
  const onStop = handleOnStop({
    word: document.querySelector("#text"),
    phrase: document.querySelector("#phrase"),
  });
  player.addListener({
    onAppReady,
    onVideoReady,
    onTimerReady,
    onTimeUpdate,
    onThrottledTimeUpdate,
    onMediaSeek,
    onPlay,
    onPause,
    onStop,
  });

  three.play();
};
