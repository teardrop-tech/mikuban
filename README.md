# みくばん - Mikuban [![GitHub Actions Status](https://github.com/teardrop-tech/mikuban/actions/workflows/build.yml/badge.svg)](https://github.com/teardrop-tech/mikuban/actions/workflows/build.yml) [![Netlify Status](https://api.netlify.com/api/v1/badges/423bbd93-7a23-4af4-9680-00b95ef486d0/deploy-status)](https://app.netlify.com/sites/mikuban/deploys)

```
初音ミク + こくばん
```

Hatsune Miku & Kokuban (Blackboard) Application

![sample](https://user-images.githubusercontent.com/46653688/135468962-9503eccc-fded-4a12-b28f-3310844039a2.png)

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

## 機能説明

### Menu > Music

![image](https://user-images.githubusercontent.com/46653688/135469580-3f2036eb-3989-40ef-a721-93be1353f296.png)

- Songs : 楽曲の選択ができます。
- Play : 楽曲の再生ができます。
- Pause : 楽曲の一時停止ができます。
- Stop : 楽曲の停止ができます。
- Volume : 楽曲の音量の変更ができます。
- Time(秒) : シークバーになっており、再生位置の変更が可能です。

### Menu > Paint

![image](https://user-images.githubusercontent.com/46653688/135469637-6bb5e709-f7a3-4f5c-a3db-2f3bd88d4f80.png)

- LineColor : 線の色を変更できます。クリックするとカラーピッカーが表示されます。
- LyricsColor : 歌詞の色を変更できます。クリックするとカラーピッカーが表示されます。既に歌詞が表示されている場合は、次の歌詞から反映されます。
- EraserMode : クリックすると消しゴムモードに変更できます。もう一度クリックすると消しゴムモードを解除できます。
- LineWidth : 線の太さを変更できます。
- ClearPaint : 描いた線を全てクリアします。
- ScreenShot : 描いた作品を画像データとして保存できます(※Menu はスクリーンショットには写りません。)
- Tweet : Twitter のツイートに遷移します。保存したスクリーンショットをツイートすることができます。

### その他

![image](https://user-images.githubusercontent.com/46653688/135469787-972f2be2-9dc8-4f47-b48f-593a48ce11a2.png)

- 黒板消しをクリックすると消しゴムモードの On/Off ができます。消しゴムモード中は赤枠で強調表示されます。
- 各種チョークをクリックすると、そのチョークの色に線の色が変更されます。

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
