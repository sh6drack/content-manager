import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { auth } from "@/auth";
import { OAUTH_CONFIGS } from "@/lib/oauth-configs";
import type { Platform } from "@/lib/constants";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await params;
  const config = OAUTH_CONFIGS[platform as Platform];

  if (!config) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
  }

  const clientId = process.env[config.clientIdEnv];
  if (!clientId) {
    return NextResponse.json(
      { error: `${platform} is not configured. Set ${config.clientIdEnv} in env vars.` },
      { status: 500 }
    );
  }

  const state = randomBytes(32).toString("hex");
  const redirectUri = `${process.env.AUTH_URL}/api/platforms/${platform}/callback`;

  const cookieStore = await cookies();

  // Store state for CSRF validation
  cookieStore.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 300, // 5 minutes
    path: "/",
    sameSite: "lax",
  });

  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
  });

  // PKCE for X/Twitter
  if (config.usePKCE) {
    const codeVerifier = randomBytes(32).toString("base64url");
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    cookieStore.set(`oauth_verifier_${platform}`, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300,
      path: "/",
      sameSite: "lax",
    });

    authParams.set("code_challenge", codeChallenge);
    authParams.set("code_challenge_method", "S256");
  }

  return NextResponse.redirect(`${config.authUrl}?${authParams.toString()}`);
}
