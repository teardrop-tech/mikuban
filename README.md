# mm2021 [![GitHub Actions Status](https://github.com/teardrop-tech/mm2021/actions/workflows/build.yml/badge.svg)](https://github.com/teardrop-tech/mm2021/actions) [![Netlify Status](https://api.netlify.com/api/v1/badges/501e0435-c297-4091-99d2-f60045463b61/deploy-status)](https://app.netlify.com/sites/teardrop-mm2021/deploys)

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

#### With TextAlive App Debugger

```shell
npm run start
ngrok http --host-header=rewrite 8080
```

Open <https://developer.textalive.jp/app/run/> and input `TextAlive App URL` to `https` url in ngrok

### Build and check

```shell
npm run build
npx serve
```

Open <http://localhost:5000>
