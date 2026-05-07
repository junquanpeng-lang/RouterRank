// Per-provider trust-velocity commentary. Surfaced on Provider detail page.
export const VELOCITY_NOTES: Record<"en" | "zh", Record<string, string>> = {
  en: {
    portkey: "Recent fingerprint matches sit above tier average. Streak intact through scheduled deploys.",
    openrouter: "Tokenizer mismatch on Claude routing has dragged Model Consistency down. Pricing drift events ticked up.",
    bai: "Output divergence on safety prompts has begun recovering after the week-2 dip.",
    together: "Pricing integrity above 90 for 3 consecutive weeks. Direct-inference path remains stable.",
    fireworks: "Fingerprint match within tolerance across every served model. No incidents in 7 days.",
    anyscale: "p95 latency drift events have ticked upward over the last 14 days.",
    replicate: "Aggressive Q4 quantization on Llama variants pushed Model Consistency below provider tier.",
    litellm: "Pure pass-through pricing held integrity at 95. Adoption for self-hosted lifts streak length.",
  },
  zh: {
    portkey: "近期指纹匹配高于同档均值。计划内发布期间连续天数未中断。",
    openrouter: "Claude 路由上的 tokenizer 不匹配拖累了模型一致性,价格漂移事件有所增加。",
    bai: "安全 prompt 上的输出偏移在第二周低谷后已开始恢复。",
    together: "定价完整性连续 3 周保持在 90 以上,直推链路稳定。",
    fireworks: "所有服务模型的指纹匹配均在容差内。过去 7 天无事件。",
    anyscale: "过去 14 天内,p95 延迟漂移事件有所上升。",
    replicate: "Llama 变体上的激进 Q4 量化使模型一致性低于同档水平。",
    litellm: "纯透传定价将完整性保持在 95。自部署采用增长延长了连续天数。",
  },
};
