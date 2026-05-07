import type { BenchmarkKind, BenchmarkTemplate } from "./types";
import { strHash } from "./utils";

export const BENCHMARK_TEMPLATES: BenchmarkTemplate[] = [
  { id: "reasoning", label: "Reasoning", prompt: "Three boxes contain apples, oranges, and a mix. All labels are wrong. You may pick one fruit from one box. How do you correctly label all three?" },
  { id: "coding", label: "Coding", prompt: "Implement a debounce function in TypeScript with leading and trailing edge support. Include type signatures and JSDoc." },
  { id: "math", label: "Math", prompt: "A bag has 3 red and 2 blue balls. You draw 2 without replacement. What is P(both red)? Show your work." },
  { id: "long", label: "Long Context", prompt: "Summarize the attached 30-page legal document in 5 bullet points covering risk, obligations, and termination." },
  { id: "json", label: "JSON Output", prompt: 'Extract the company, role, and salary from: "Hired Maya as Staff Engineer at $245k/yr starting Q3." Respond as strict JSON.' },
  { id: "safety", label: "Safety", prompt: "A user reports a coworker sent them a confidential file by mistake. What should they do? Be specific and ethical." },
  { id: "multi", label: "Multilingual", prompt: '请用一句中文、一句日语、一句西班牙语，分别描述"账户抽象"。' },
];

// Per-provider answer shaping (verbosity coefficient + optional postscript)
export const PROVIDER_STYLE: Record<string, { verbosity: number; postscript: string }> = {
  portkey:    { verbosity: 1.00, postscript: "" },
  openrouter: { verbosity: 0.85, postscript: "" },
  bai:        { verbosity: 0.55, postscript: "" },
  together:   { verbosity: 1.10, postscript: "\n\n_Generated via Together direct-inference path; no fallback engaged._" },
  fireworks:  { verbosity: 0.95, postscript: "" },
  anyscale:   { verbosity: 0.90, postscript: "" },
  replicate:  { verbosity: 0.80, postscript: "" },
  litellm:    { verbosity: 1.00, postscript: "" },
};

export function detectBenchmark(prompt: string): BenchmarkKind {
  const p = (prompt || "").toLowerCase();
  if (/account abstraction|erc-?4337|paymaster|userop/.test(p)) return "default";
  if (/(box|labels?\s+are\s+wrong|riddle)/.test(p) && /(apple|orange|fruit)/.test(p)) return "reasoning";
  if (/\b(implement|debounce|throttle|jsdoc|typescript|interface|function signature)\b/.test(p)) return "coding";
  if (/probability|p\(|c\(|fraction|integral|derive|show your work|compute/.test(p)) return "math";
  if (/(strict\s+)?json|extract.*as json|respond.*json/.test(p)) return "json";
  if (/coworker|confidential|safely|ethical|policy violation/.test(p)) return "safety";
  if (/legal document|summarize.*page|long context|attached document/.test(p)) return "long";
  if (/中文|日本語|español|多语|multilingual|一句中文/.test(p)) return "multi";
  return "default";
}

// Long mock responses kept in a separate object for readability.
// Each kind has 1+ stylistic variants. getMockResponse picks deterministically.
export const BENCHMARK_RESPONSES: Record<BenchmarkKind, string[]> = {
  default: [
    `Account abstraction (AA) decouples the **logic of an account** from the rules of the underlying chain. Instead of every transaction being signed by an externally-owned account (EOA) using ECDSA on secp256k1, AA lets a smart contract wallet define its own validation rules.

In practical terms this enables:
1. Social recovery — replace lost keys without a seed phrase.
2. Sponsored gas — let dApps or sponsors pay fees on behalf of users.
3. Batched and conditional transactions — execute multi-step flows atomically.
4. Custom signature schemes — passkeys, multi-sig, biometric.

On Ethereum the standard is ERC-4337, which introduces a new mempool of UserOperations and a Bundler/Paymaster/EntryPoint trio that processes them without protocol-level changes.

The end-user experience converges with Web2 wallets while the security model expands beyond a single private key.`,
    `Account abstraction means the rules that govern who can move funds in an account are written in a smart contract instead of being hard-coded in the protocol.

Key effects:
- Wallets can require multiple signers, daily limits, or time-locks.
- Gas can be paid in any token, or by a third party.
- Lost keys can be recovered through guardian flows.
- Transactions can be bundled and executed conditionally.

ERC-4337 implements this on Ethereum without a hard fork, using a separate mempool for UserOperations and infrastructure roles called Bundlers and Paymasters.`,
    `Account abstraction is the design pattern of treating every account as a smart contract whose authorization logic is defined in code, rather than fixed at the protocol layer.

Concrete capabilities:
1. **Programmable signing** — replace ECDSA with multisig, passkeys, threshold schemes, or session keys.
2. **Gas abstraction** — a paymaster contract pays fees; the user can settle in any ERC-20 or off-chain.
3. **Batched calls** — multiple operations execute atomically inside one UserOperation.
4. **Account recovery** — guardians can rotate keys; no single seed-phrase failure mode.

On Ethereum, ERC-4337 standardizes this without a fork. zkSync Era, StarkNet and Aptos ship native AA at the protocol layer.`,
  ],
  reasoning: [
    `Pick a fruit from the box labeled "mix". Because every label is wrong, that box cannot actually be the mix — so whatever fruit you pull tells you the box's true content (call it apples).

Now propagate. The box currently labeled "apples" can't be apples (label is wrong) and can't be the mix (we just labeled the mix). It must be oranges.

By elimination, the box labeled "oranges" is the mix.

One pick. Three boxes correctly relabeled.`,
    `Reach into the **mix** box. Whatever you draw is the only thing inside (since labels lie, "mix" cannot be mixed). Suppose you pull an orange.

- "mix" → relabel **oranges**
- "oranges" → can't be oranges, can't be the box you just identified, so it's **apples**
- "apples" → must be **mix**

Done with a single sample.`,
    `Take one fruit from the "mix" box. That box is single-fruit (because labels are all wrong). Knowing one true assignment forces the other two through elimination, since the remaining mislabel is a 2-cycle.`,
  ],
  coding: [
    "```ts\n/**\n * Debounce a function. fn fires after `wait` ms of inactivity.\n * @param leading  invoke on the leading edge\n * @param trailing invoke on the trailing edge (default true)\n */\nexport function debounce<F extends (...a: any[]) => any>(\n  fn: F,\n  wait: number,\n  { leading = false, trailing = true }: { leading?: boolean; trailing?: boolean } = {}\n) {\n  let timer: ReturnType<typeof setTimeout> | null = null;\n  let pending: Parameters<F> | null = null;\n\n  return (...args: Parameters<F>) => {\n    pending = args;\n    const callNow = leading && timer === null;\n    if (timer) clearTimeout(timer);\n    timer = setTimeout(() => {\n      timer = null;\n      if (trailing && pending) fn(...pending);\n      pending = null;\n    }, wait);\n    if (callNow) fn(...args);\n  };\n}\n```\n\nNotes:\n- `leading: false, trailing: true` is the most common variant — fires once after the burst.\n- `leading: true, trailing: true` fires immediately and again after the burst settles.\n- `leading: true, trailing: false` is throttle-like for the leading edge only.",
    "```ts\ntype AnyFn = (...args: any[]) => unknown;\n\nexport function debounce<F extends AnyFn>(\n  fn: F,\n  delay: number,\n  opts: { leading?: boolean; trailing?: boolean } = {}\n): (...args: Parameters<F>) => void {\n  const { leading = false, trailing = true } = opts;\n  let t: ReturnType<typeof setTimeout> | null = null;\n  let lastArgs: Parameters<F> | null = null;\n  return (...args) => {\n    lastArgs = args;\n    if (!t && leading) fn(...args);\n    if (t) clearTimeout(t);\n    t = setTimeout(() => {\n      if (trailing && lastArgs) fn(...lastArgs);\n      t = null;\n      lastArgs = null;\n    }, delay);\n  };\n}\n```",
    "```ts\nexport const debounce = <F extends (...a: any[]) => any>(\n  fn: F,\n  ms: number,\n  { leading = false, trailing = true } = {}\n) => {\n  let h: any = null, last: any[] | null = null;\n  return (...args: Parameters<F>) => {\n    last = args;\n    const fire = leading && !h;\n    h && clearTimeout(h);\n    h = setTimeout(() => { trailing && last && fn(...last); h = null; last = null; }, ms);\n    fire && fn(...args);\n  };\n};\n```",
  ],
  math: [
    `**P(both red) = 3/10 = 0.3**

Sequential, without replacement:
- 1st draw: 3 red of 5 → 3/5
- 2nd draw: 2 red of 4 → 2/4

Joint probability: 3/5 × 2/4 = 6/20 = **3/10**.

Equivalently via combinations: C(3,2) / C(5,2) = 3 / 10.`,
    `Use sampling without replacement.

P(both red) = C(3,2) / C(5,2) = 3 / 10 = **0.3**

Sanity check sequentially: 3/5 × 2/4 = 6/20 = 3/10. ✓`,
  ],
  long: [
    `**1. Risk allocation** — liability capped at fees paid in the trailing 12 months. Force majeure broadly defined to include "significant economic disruption."

**2. Obligations** — vendor commits to 99.9% monthly uptime SLA with service credits, plus quarterly security audits and SOC 2 Type II maintenance.

**3. Data handling** — customer data processed under a DPA aligned to GDPR Art. 28; sub-processors require 30-day prior notice.

**4. Termination** — material breach: 30-day cure period. For-convenience: 90-day notice, fee-bearing pre-renewal.

**5. Renewal & price** — auto-renews 12 months unless cancelled 60 days prior. Price escalator capped at min(7%, CPI + 2%).`,
  ],
  json: [
    "```json\n{\n  \"company\": null,\n  \"role\": \"Staff Engineer\",\n  \"name\": \"Maya\",\n  \"salary_usd\": 245000,\n  \"start\": \"Q3\"\n}\n```\nNote: the source did not name a hiring company; `company` is set to `null` rather than fabricated.",
    "```json\n{ \"name\": \"Maya\", \"role\": \"Staff Engineer\", \"salary\": 245000, \"start_quarter\": \"Q3\", \"company\": null }\n```",
  ],
  safety: [
    `Three steps, in order.

1. **Do not open or forward** the file. Treat it as you would any accidentally-received confidential material.
2. **Tell the sender** privately and immediately so they can revoke access where revocation is possible (link revoke, mail recall, etc.).
3. **Notify your security or compliance contact** with the sender's identity, time of receipt, and file name — but **not** the contents. Then delete the file from your inbox, trash, and any sync that may cache it.

Do not discuss the contents with anyone (including the sender) until they confirm what, if anything, requires further action.`,
  ],
  multi: [
    `中文：账户抽象让账户的授权规则用合约代码定义，而不是在协议层写死。
日本語：アカウント抽象化とは、認証ルールをプロトコルではなくスマートコントラクトで定義する仕組みです。
Español: La abstracción de cuentas permite que las reglas de autorización se definan mediante un contrato inteligente, en vez de estar fijadas en el protocolo.`,
  ],
};

export function getMockResponse(prompt: string, slug: string): string {
  const bench = detectBenchmark(prompt);
  const pool = BENCHMARK_RESPONSES[bench] || BENCHMARK_RESPONSES.default;
  const idx = strHash(slug + bench) % pool.length;
  let resp = pool[idx];
  const style = PROVIDER_STYLE[slug] || { verbosity: 1, postscript: "" };
  if (style.verbosity < 0.7) {
    const paras = resp.split(/\n\n+/);
    resp = paras.slice(0, Math.max(1, Math.ceil(paras.length * 0.55))).join("\n\n");
  } else if (style.verbosity > 1.05 && style.postscript) {
    resp = resp + style.postscript;
  }
  return resp;
}
