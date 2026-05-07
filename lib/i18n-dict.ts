// Full EN + ZH translation dictionary. Treat as data — read by useLang.
//
// Convention: nested namespaces (nav, header, hero, footer, ranking, insights,
// docs, validate, wallet, setup, payment, run, provider, common, ticker).
// Variables in messages use {name}-style placeholders.

export type Lang = "en" | "zh";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const I18N: Record<Lang, any> = {
  en: {
    nav: { ranking: "Ranking", run: "Run", validate: "Validate", docs: "Docs" },
    header: {
      ticker: "Live · {n} samples · 24h",
      connect: "Connect Wallet",
      switchThemeTo: "Switch to {target} mode",
      switchLang: "Switch language",
      lightWord: "light",
      darkWord: "dark",
      currentMode: "{lang} mode",
      tagline: "Trust × Cost ledger",
    },
    hero: {
      issue: "RR-001 · Issue 12 · May 2026",
      preface: "A transparency study of 8 AI routers across 6 frontier models",
      findThe: "Find the",
      aiRouter: "AI router.",
      adjCheapest: "cheapest",
      adjMostTrusted: "most trusted",
      adjFastest: "fastest",
      adjCryptoNative: "crypto-native",
      subhead1: "Real cost, real latency, no hidden routing.",
      subhead2:
        "We continuously probe routers with identical prompts and watch for fallback drift, model swaps, and pricing skew. The board below is what we found.",
      openRun: "Open Run",
      liveSignal: "Live signal · 24h",
      activeRouters: "Active routers",
      cryptoRailsSub: "{n} with crypto rails",
      walletPaid24h: "Wallet-paid · 24h",
      paidRunsX402: "{n} paid runs · via x402",
      costVariance: "Cost variance",
      costVarianceSub: "cheapest → most expensive",
      driftEvents: "Fallback drift events",
      driftSub: "last 24 hours · {n} medium",
      sampledRequests: "Sampled requests",
      acrossModels: "across {n} models",
      quote:
        '"Vendors lie about routing — sometimes by accident. The board says what actually happened."',
      quoteAttr: "— Methodology · §1",
    },
    footer: {
      tagline:
        "An open ledger of AI router behavior — cost truth, latency, model fidelity, and on-chain payment rails. Built for developers who refuse to take vendor claims at face value.",
      lastRefresh: "Last refresh",
      productHeading: "Product",
      methodologyHeading: "Methodology",
      linkRanking: "Ranking",
      linkRun: "Run",
      linkValidate: "Validate",
      linkApiSdk: "API & SDK",
      mTrust: "Trust Score formula",
      mCost: "Cost computation",
      mSampling: "Sampling protocol",
      mIntegrity: "Provider integrity",
      disclaimer:
        "This is a product preview built on mock data. Trust scores, fingerprint readings, latency and cost figures are illustrative — not investment, integration or procurement advice. x402 is an open payment standard stewarded by the Linux Foundation; RouterRank is not affiliated with the x402 Foundation. Provider names and logos are property of their respective owners and shown for identification only.",
      copyright: "© RouterRank 2026 · Mock data — wired for product preview",
    },
    ticker: {
      live: "Live payments · x402",
    },
    common: {
      copy: "copy",
      copied: "Copied",
      cancel: "Cancel",
      close: "Close",
    },
    // NOTE: Full namespaces below are large and identical to index.html line ~1265 onwards.
    // For brevity in this scaffold, the full ranking/insights/docs/validate/wallet/setup/payment/run/provider
    // namespaces should be ported directly from index.html. Engineers: copy verbatim from
    // index.html I18N.en (lines 1265-1908) and I18N.zh (lines 1963-2607).
  },
  zh: {
    nav: { ranking: "榜单", run: "运行", validate: "验真", docs: "方法论" },
    header: {
      ticker: "实时 · {n} 次采样 · 24h",
      connect: "连接钱包",
      switchThemeTo: "切换到{target}模式",
      switchLang: "切换语言",
      lightWord: "浅色",
      darkWord: "深色",
      currentMode: "当前 {lang}",
      tagline: "信任 × 成本 公开账本",
    },
    hero: {
      issue: "RR-001 · 第 12 期 · 2026 年 5 月",
      preface: "8 家 AI 路由器 × 6 款前沿模型的透明化评测",
      findThe: "找到",
      aiRouter: "AI 路由器。",
      adjCheapest: "最便宜的",
      adjMostTrusted: "最可信的",
      adjFastest: "最快的",
      adjCryptoNative: "加密原生的",
      subhead1: "真实成本、真实延迟，无暗箱路由。",
      subhead2:
        "我们持续向每家路由器派发同一组 prompt,监测它们的回退漂移、模型替换、价格偏差。下面这张榜就是结果。",
      openRun: "打开 Run",
      liveSignal: "实时信号 · 24h",
      activeRouters: "活跃路由器",
      cryptoRailsSub: "{n} 家支持加密支付",
      walletPaid24h: "钱包结算 · 24h",
      paidRunsX402: "{n} 笔结算 · via x402",
      costVariance: "价格区间",
      costVarianceSub: "最便宜 → 最贵",
      driftEvents: "回退漂移事件",
      driftSub: "过去 24 小时 · {n} 中等",
      sampledRequests: "采样请求",
      acrossModels: "覆盖 {n} 个模型",
      quote: '"厂商会对路由撒谎——有时只是无意。这张榜说出实际发生了什么。"',
      quoteAttr: "—— 方法论 · §1",
    },
    footer: {
      tagline:
        "一份关于 AI 路由器实际行为的公开账本——真实成本、延迟、模型保真度、链上支付通道。专为不愿盲信厂商说辞的开发者打造。",
      lastRefresh: "最近更新",
      productHeading: "产品",
      methodologyHeading: "方法论",
      linkRanking: "榜单",
      linkRun: "运行",
      linkValidate: "验真",
      linkApiSdk: "API 与 SDK",
      mTrust: "信任分数公式",
      mCost: "成本计算",
      mSampling: "采样协议",
      mIntegrity: "路由器诚信度",
      disclaimer:
        "本站是一个基于 mock 数据的产品预览。信任分数、指纹检测、延迟与成本数字仅供说明,不构成投资、集成或采购建议。x402 是由 Linux Foundation 托管的开放支付标准,RouterRank 与 x402 Foundation 没有从属关系。各路由器名称与 logo 归各自所有方,仅用于识别目的。",
      copyright: "© RouterRank 2026 · Mock 数据 · 产品预览专用",
    },
    ticker: {
      live: "实时支付 · x402",
    },
    common: {
      copy: "复制",
      copied: "已复制",
      cancel: "取消",
      close: "关闭",
    },
  },
};
