# みくばん - Mikuban [![GitHub Actions Status](https://github.com/teardrop-tech/mikuban/actions/workflows/build.yml/badge.svg)](https://github.com/teardrop-tech/mikuban/actions/workflows/build.yml) [![Netlify Status](https://api.netlify.com/api/v1/badges/423bbd93-7a23-4af4-9680-00b95ef486d0/deploy-status)](https://app.netlify.com/sites/mikuban/deploys)

```
初音ミク + こくばん
```

Hatsune Miku & Kokuban (Blackboard) Application

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
