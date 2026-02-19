export const DEFAULT_CHAT_MODEL = "openai/gpt-4.1-mini";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // OpenAI
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    description: "Fast and cost-effective for simple tasks",
  },
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "Flagship OpenAI model, great all-rounder",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Fast multimodal model with vision support",
  },
  // Anthropic
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast and affordable, great for everyday tasks",
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Best balance of speed, intelligence, and cost",
  },
  {
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    description: "Most capable Anthropic model",
  },
  // Google
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description: "Ultra fast and affordable",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    description: "Most capable Google model",
  },
  // OpenRouter (open-source / third-party models)
  {
    id: "openrouter/deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "openrouter",
    description: "Strong reasoning model, open-source",
  },
  {
    id: "openrouter/meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "openrouter",
    description: "Meta's most capable open model",
  },
  {
    id: "openrouter/mistralai/mistral-large-2411",
    name: "Mistral Large",
    provider: "openrouter",
    description: "Mistral's flagship model",
  },
  // Reasoning models (extended thinking)
  {
    id: "anthropic/claude-3.7-sonnet-thinking",
    name: "Claude 3.7 Sonnet",
    provider: "reasoning",
    description: "Extended thinking for complex problems",
  },
  {
    id: "openai/o4-mini",
    name: "o4-mini",
    provider: "reasoning",
    description: "OpenAI reasoning model, fast and efficient",
  },
];

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>,
);
