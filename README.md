# みくばん - Mikuban [![GitHub Actions Status](https://github.com/teardrop-tech/mikuban/actions/workflows/build.yml/badge.svg)](https://github.com/teardrop-tech/mikuban/actions/workflows/build.yml) [![Netlify Status](https://api.netlify.com/api/v1/badges/423bbd93-7a23-4af4-9680-00b95ef486d0/deploy-status)](https://app.netlify.com/sites/mikuban/deploys)

```
初音ミク + こくばん
```

Hatsune Miku & Kokuban (Blackboard) Application

## Demo

<https://mikuban.netlify.app>

<details>
<summary>:camera: QR Code</summary>

```
█████████████████████████████████
█████████████████████████████████
████ ▄▄▄▄▄ █▀█ █▄█▀▀▄█ ▄▄▄▄▄ ████
████ █   █ █▀▀▀█ ▀ █▄█ █   █ ████
████ █▄▄▄█ █▀ █▀▀█ ▀▄█ █▄▄▄█ ████
████▄▄▄▄▄▄▄█▄▀ ▀▄█▄█ █▄▄▄▄▄▄▄████
████ ▄  ▄▀▄  ▄▀▄  ▄██▄█ █▄█ █████
████▄██▀▀▄▄▄▀█▄█ █▄▄▀▀▀ ▀▄█▄ ████
████ ▄▀  ▀▄ ▄ ▄▀█ ▄█▀▄▄▀▄▀▄ ▄████
████ █  ▄▀▄▄▄  █ █▀ ▄▀█  ▄█▄ ████
████▄███▄▄▄▄▀▀▀▀█▄▄  ▄▄▄ ▀▄██████
████ ▄▄▄▄▄ █▄███▀▄▄█ █▄█ ▀▄ ▄████
████ █   █ █ ▄█▀▄      ▄ ▀ ▀▀████
████ █▄▄▄█ █ ▄ ▀▄█▀ ▀ ▀▀▀ ▄█ ████
████▄▄▄▄▄▄▄█▄▄█▄▄▄███▄▄▄▄▄▄▄▄████
█████████████████████████████████
█████████████████████████████████
```

</details>

## 概要

黒板アートをコンセプトにした、リリックペイントアプリケーションです。  
マジカルミライ 2021 を彩る楽曲と共に、オリジナルの黒板アートを作成できます。  
お気に入りの楽曲の歌詞と共に、オリジナルの「みくばんアート」を創造し、  
年に一度の祭典を一緒に盛り上げよう！

## 特徴

- 観るだけではなく Web のインタラクティブを生かした「体験」ができる
- 黒板をコンセプトにした世界観
- 描ける線をチョーク調に
- 楽曲情報を用いた日直風表示
- 歌詞の色、線の色・太さのカスタマイズ機能
- 描いた作品をスクリーンショットとして保存できる

## 動作確認済み環境

※スマートフォンでも動作しますが、端末や OS、端末のサイズ によっては正しく動作しない場合があります。

- Windows : Edge、Google Chrome、Firefox
- Mac : Safari、Google Chrome
- Android : Google Chrome
- iOS : Safari、Google Chrome

## 開発者向け

### Setup

```shell
npm ci
```

Copy `.env.sample` to `.env`

Replace `<your_token>` to your development token via <https://developer.textalive.jp/profile>

### Development

```shell
npm run start
```

Open <http://localhost:8080>

#### With debug mode

```shell
npm run start:debug
```

#### With TextAlive App Debugger

```shell
npm run start
ngrok http --host-header=rewrite 8080
```

Open <https://developer.textalive.jp/app/run/> and input `TextAlive App URL` to `https` url in ngrok

### Build and check

```shell
npm run build
npx -y serve dist
```

Open <http://localhost:5000>

## Licence

- [TextAlive App API](https://github.com/TextAliveJp/textalive-app-api/blob/master/LICENSE.md)
- [Tweakpane](https://github.com/cocopon/tweakpane)
- [icon](https://remixicon.com/)
- [font](https://fonts.google.com/specimen/Yusei+Magic)
- [Loading Display](https://dubdesign.net/download/html-css/htmlcss-loading8/)
