/**
 * Server-side LLM provider adapters.
 *
 * Each provider maps to an environment variable that must be configured in
 * Vercel (Settings → Environment Variables) to enable that agent:
 *
 *   DEEPSEEK_API_KEY   → DeepSeek (OpenAI-compatible API)
 *   OPENAI_API_KEY     → OpenAI
 *   ANTHROPIC_API_KEY  → Anthropic
 *   GEMINI_API_KEY     → Google Gemini
 *   DASHSCOPE_API_KEY  → Alibaba Qwen (DashScope, OpenAI-compatible API)
 *
 * When a key is missing the corresponding agent falls back to a local
 * heuristic and the UI says so explicitly — the platform never pretends.
 */

export type LlmProvider = "deepseek" | "openai" | "anthropic" | "gemini" | "dashscope";

export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
}

interface ProviderSpec {
  label: string;
  envKey: string;
  defaultModel: string;
  call: (
    model: string,
    system: string,
    user: string,
    opts: Required<ChatOptions>,
    apiKey: string,
    fetchImpl?: typeof fetch
  ) => Promise<string>;
}

function openAiCompatible(
  url: string
): ProviderSpec["call"] {
  return async (model, system, user, opts, apiKey, fetchImpl = fetch) => {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`LLM API ${res.status}: ${text.slice(0, 300)}`);
    }
    const json = await res.json();
    return json?.choices?.[0]?.message?.content ?? "";
  };
}

const PROVIDERS: Record<LlmProvider, ProviderSpec> = {
  deepseek: {
    label: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    defaultModel: "deepseek-chat",
    call: openAiCompatible("https://api.deepseek.com/chat/completions"),
  },
  openai: {
    label: "OpenAI",
    envKey: "OPENAI_API_KEY",
    defaultModel: "gpt-4o",
    call: openAiCompatible("https://api.openai.com/v1/chat/completions"),
  },
  dashscope: {
    label: "Qwen (DashScope)",
    envKey: "DASHSCOPE_API_KEY",
    defaultModel: "qwen-max",
    call: openAiCompatible(
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
    ),
  },
  anthropic: {
    label: "Anthropic",
    envKey: "ANTHROPIC_API_KEY",
    defaultModel: "claude-3-7-sonnet-latest",
    call: async (model, system, user, opts, apiKey, fetchImpl = fetch) => {
      const res = await fetchImpl("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          system,
          messages: [{ role: "user", content: user }],
          max_tokens: opts.maxTokens,
          temperature: opts.temperature,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 300)}`);
      }
      const json = await res.json();
      return json?.content?.map((c: { text?: string }) => c.text ?? "").join("") ?? "";
    },
  },
  gemini: {
    label: "Gemini",
    envKey: "GEMINI_API_KEY",
    defaultModel: "gemini-2.0-flash",
    call: async (model, system, user, opts, apiKey, fetchImpl = fetch) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: {
            maxOutputTokens: opts.maxTokens,
            temperature: opts.temperature,
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Gemini API ${res.status}: ${text.slice(0, 300)}`);
      }
      const json = await res.json();
      return json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    },
  },
};

export function getProviderSpec(provider: LlmProvider): ProviderSpec {
  return PROVIDERS[provider];
}

export function providerAvailable(provider: LlmProvider): boolean {
  return Boolean(process.env[PROVIDERS[provider].envKey]);
}

export async function chat(
  provider: LlmProvider,
  model: string,
  system: string,
  user: string,
  opts: ChatOptions = {}
): Promise<string> {
  const spec = PROVIDERS[provider];
  const apiKey = process.env[spec.envKey];
  if (!apiKey) {
    throw new Error(`Missing ${spec.envKey} — provider ${provider} is not configured`);
  }
  const merged: Required<ChatOptions> = {
    maxTokens: opts.maxTokens ?? 300,
    temperature: opts.temperature ?? 0.7,
  };
  const content = await spec.call(model, system, user, merged, apiKey);
  return content.trim();
}
