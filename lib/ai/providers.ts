import { createAnthropic } from "@ai-sdk/anthropic";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";

export type UserApiKeys = {
  anthropic?: string;
};

const TITLE_MODEL = "claude-sonnet-4-5";
const ARTIFACT_MODEL = "claude-sonnet-4-5";

function getAnthropicProvider(keys: UserApiKeys) {
  if (!keys.anthropic) {
    throw new Error("Anthropic API key not configured");
  }
  return createAnthropic({ apiKey: keys.anthropic });
}

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string, keys: UserApiKeys) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const modelName = modelId.includes("/")
    ? modelId.split("/").slice(1).join("/")
    : modelId;

  return getAnthropicProvider(keys)(modelName);
}

export function getTitleModel(keys: UserApiKeys) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  return getAnthropicProvider(keys)(TITLE_MODEL);
}

export function getArtifactModel(keys: UserApiKeys) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }

  return getAnthropicProvider(keys)(ARTIFACT_MODEL);
}
