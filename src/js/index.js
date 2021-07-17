'use strict';

import { Player, Ease } from 'textalive-app-api';

// DOM
const artistNameEl = document.querySelector('#artist span');
const songNameEl = document.querySelector('#song span');
const playBtns = document.querySelectorAll('#play');
const jumpBtn = document.querySelector('#jump');
const pauseBtn = document.querySelector('#pause');
const rewindBtn = document.querySelector('#rewind');
const positionEl = document.querySelector('#position strong');

/**
 * 再生コントロールの表示
 */
const showControl = function () {
  document.querySelector('#control').style.display = 'block';

  // 再生ボタン
  playBtns.forEach((playBtn) =>
    playBtn.addEventListener('click', () => {
      player.video && player.requestPlay();
    })
  );

  // 歌詞頭出しボタン
  jumpBtn.addEventListener(
    'click',
    () => player.video && player.requestMediaSeek(player.video.firstChar.startTime)
  );

  // 一時停止ボタン
  pauseBtn.addEventListener(
    'click',
    () => player.video && player.requestPause()
  );

  // 巻き戻しボタン
  rewindBtn.addEventListener(
    'click',
    () => player.video && player.requestMediaSeek(0)
  );
};

/**
 * 楽曲情報の設定
 */
const setMusicInfo = function () {
  // アーティスト名
  const artistName = player.data.song.artist.name;
  // 曲名
  const songName = player.data.song.name;

  // 要素に情報の表示
  artistNameEl.textContent = artistName;
  songNameEl.textContent = songName;
};

/**
 * 単語が発声されていたら #text に表示する
 * @param {*} now
 * @param {*} unit
 */
const animateWord = function (now, unit) {
  if (unit.contains(now)) {
    document.querySelector('#text').textContent = unit.text;
  }
};

/**
 * フレーズが発声されていたら #phrase に表示する
 * @param {*} now
 * @param {*} unit
 */
const animatePhrase = function (now, unit) {
  if (unit.contains(now)) {
    document.querySelector('#phrase').textContent = unit.text;
  }
};

// TextAlive Playerを生成
const player = new Player({
  app: {
    appAuthor: 'Teardrop',
    appName: 'mm2021'
  },
  valenceArousalEnabled: true,
  vocalAmplitudeEnabled: true
});

// リスナー登録
player.addListener({
  // TextAlive Appが初期化されたときに呼ばれる
  onAppReady: (app) => {
    if (!app.songUrl) {
      // URLを指定して楽曲をもとにした動画データを作成
      player.createFromSongUrl('https://www.youtube.com/watch?v=XSLhsjepelI'); // グリーンライツ・セレナーデ
    }
    if (!app.managed) {
      // ホストと接続されていなければ再生コントロールを表示
      showControl();
    }
  },

  // 動画オブジェクトの準備が整ったとき(楽曲に関する情報を読み込み終わったとき)に呼ばれる
  onVideoReady: (v) => {
    // 定期的に呼ばれる各単語の"animate"関数をセットする
    let word = player.video.firstWord;
    while (word) {
      word.animate = animateWord;
      word = word.next;
    }

    // 定期的に呼ばれるフレーズの"animate"関数をセットする
    let phrase = player.video.firstPhrase;
    while (phrase) {
      phrase.animate = animatePhrase;
      phrase = phrase.next;
    }

    // 楽曲情報の設定
    setMusicInfo();
  },

  // 音源の再生準備が完了した時に呼ばれる
  onTimerReady: (t) => {
    // ボタンを有効化する
    if (!player.app.managed) {
      document
        .querySelectorAll('button')
        .forEach((btn) => (btn.disabled = false));
    }

    // 歌詞がなければ歌詞頭出しボタンを無効にする
    jumpBtn.disabled = !player.video.firstChar;
  },

  onTimeUpdate: (pos) => {
    const beat = player.findBeat(pos);
    if (!beat) {
      return;
    }
    document.querySelector('#beats').textContent = `${Math.ceil(Ease.circIn(beat.progress(pos)) * 100)}%`;

    const chords = player.findChord(pos);
    if (!chords) {
      return;
    }
    document.querySelector('#chords').textContent = `${chords.name}`;

    const va = player.getValenceArousal(pos);
    if (!va) {
      return;
    }
    document.querySelector('#va').textContent = `${va.v} / ${va.a}`;

    const amplitude = player.getVocalAmplitude(pos);
    if (!amplitude) {
      return;
    }
    document.querySelector('#amplitude').textContent = `${amplitude}`;
  },

  // 動画の再生位置が変更されたときに呼ばれる(あまりに頻繁な発火を防ぐため一定間隔に間引かれる)
  onThrottledTimeUpdate: (pos) => {
    // 再生位置を表示する
    positionEl.textContent = String(Math.floor(pos));
  },

  onPlay: () => console.log('再生開始'),

  onPause: () => {
    // 歌詞表示をリセット
    document.querySelector('#text').textContent = '-';
    document.querySelector('#phrase').textContent = '-';
  },

  onStop: () => {
    // 歌詞表示をリセット
    // document.querySelector('#text').textContent = '-';
    // document.querySelector('#phrase').textContent = '-';
  }

  // onMediaSeek: (position) => console.log('再生位置の変更:', position, 'ミリ秒')
});
