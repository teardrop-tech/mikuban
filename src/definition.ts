export const theme = {
  color: {
    miku: "#54c5a3",
    rin: "#ffd98c",
    ren: "#fcf5a7",
    luka: "#c8a5a5",
    kaito: "#545cc5",
    meiko: "#c55454",
    blackboard: "#3d5347",
    white: "#ffffff",
  },
} as const;

export const paintSettings = {
  lineWidth: 10,
} as const;

export const musicList = [
  {
    text: "First Note / blues",
    value: "https://piapro.jp/t/FDb1/20210213190029",
  },
  {
    text: "嘘も本当も君だから / 真島ゆろ",
    value: "https://piapro.jp/t/YW_d/20210206123357",
  },
  {
    text: "その心に灯る色は / ラテルネ",
    value: "https://www.youtube.com/watch?v=bMtYf3R0zhY",
  },
  {
    text: "夏をなぞって / シロクマ消しゴム",
    value: "https://piapro.jp/t/R6EN/20210222075543",
  },
  {
    text: "密かなる交信曲 / 濁茶",
    value: "https://www.youtube.com/watch?v=Ch4RQPG1Tmo",
  },
  {
    text: "Freedom! / Chiquewa",
    value: "https://piapro.jp/t/N--x/20210204215604",
  },
] as const;

export const twitter = {
  baseUrl: `https://twitter.com/intent/tweet`,
  text: `
${location.href}`,
  hashtags: [
    "初音ミク",
    "マジカルミライ2021",
    "mm2021procon",
    "みくばん",
    "みくばんアート",
  ],
  via: "teardrop_tech",
  toURL: () => {
    const url = new URL(twitter.baseUrl);
    url.searchParams.append("text", twitter.text);
    url.searchParams.append("hashtags", twitter.hashtags.join());
    url.searchParams.append("via", twitter.via);
    return url.href;
  },
} as const;

export const defaultMusic = musicList[2];

// 免責事項(TODO: ローカライズ)
export const disclaimer = `スクリーンショットをダウンロードしますか？
当サイト、またはコンテンツのご利用により、万一、ご利用者様に何らかの不都合や損害が発生したとしても、当サークルは何らの責任を負うものではありません。
スクリーンショットをご使用の際は、ご注意いただきますようお願い申し上げます。
※お使いの端末、ブラウザーによっては、ダウンロード方法が一部異なりますのでご注意ください。`;

export const lyricsFadeTimeMs = 100;
