import { auth } from "@/app/(auth)/auth";
import {
  deleteUserApiKey,
  getUserApiKeyProviders,
  upsertUserApiKey,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  try {
    const providers = await getUserApiKeyProviders({
      userId: session.user.id,
    });
    return Response.json(providers);
  } catch (_error) {
    return new ChatSDKError(
      "bad_request:api",
      "Failed to fetch API keys",
    ).toResponse();
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  try {
    const body = (await request.json()) as {
      provider: string;
      apiKey: string;
    };

    if (!body.provider || !body.apiKey) {
      return new ChatSDKError("bad_request:api", "Missing provider or apiKey").toResponse();
    }

    if (body.provider !== "anthropic") {
      return new ChatSDKError("bad_request:api", "Invalid provider. Only Anthropic is supported.").toResponse();
    }

    if (body.apiKey.length < 10) {
      return new ChatSDKError("bad_request:api", "API key too short").toResponse();
    }

    const provider: "openai" | "anthropic" = body.provider;

    await upsertUserApiKey({
      userId: session.user.id,
      provider,
      apiKey: body.apiKey,
    });

    return Response.json({ success: true });
  } catch (_error) {
    return new ChatSDKError(
      "bad_request:api",
      "Failed to save API key",
    ).toResponse();
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  try {
    const body = (await request.json()) as { provider: string };

    if (!body.provider) {
      return new ChatSDKError("bad_request:api", "Missing provider").toResponse();
    }

    if (body.provider !== "anthropic") {
      return new ChatSDKError("bad_request:api", "Invalid provider. Only Anthropic is supported.").toResponse();
    }

    const provider: "openai" | "anthropic" = body.provider;

    await deleteUserApiKey({
      userId: session.user.id,
      provider,
    });

    return Response.json({ success: true });
  } catch (_error) {
    return new ChatSDKError(
      "bad_request:api",
      "Failed to delete API key",
    ).toResponse();
  }
}
