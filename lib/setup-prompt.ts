import type { Provider } from "./types";

// Build a copy-pasteable prompt that the user feeds to their own agent
// (Claude Code / Cursor / ChatGPT / etc). The agent then loads the
// cobo-agentic-wallet skill, mints a fresh wallet, funds it, and wires
// it up to settle x402 payments for the chosen Router.
export function setupPrompt(provider: Provider, fundingUsd = 20): string {
  const apiUrl = provider.domain
    ? `https://${provider.domain.startsWith("api.") ? provider.domain : "api." + provider.domain}/v1/chat/completions`
    : "https://your-router.example.com/v1/chat/completions";
  return `I want to use ${provider.name} for AI inference and pay per-request from a dedicated Agent Wallet (x402 / USDC on Base).

Please do the following:

1. Load the cobo-agentic-wallet skill (or equivalent wallet tooling if your runtime exposes one).
2. Create a fresh agent wallet on Base mainnet — separate from my main wallet.
3. Transfer $${fundingUsd} USDC from my main wallet to the new agent wallet.
4. Configure the wallet to sign x402 payment intents whenever I call this endpoint:
   ${apiUrl}
5. Save the wallet address + signer config so subsequent requests to ${provider.name} auto-settle.
6. Run a single "ping" chat completion against the endpoint and report:
   - Wallet address
   - Initial balance
   - Cost paid for the ping
   - Gas + x402 fee consumed

After setup, route any chat-completion request I make to ${provider.name} through this wallet automatically.`;
}
