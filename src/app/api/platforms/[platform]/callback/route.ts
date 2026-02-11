import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { platformConnections } from "@/db/schema";
import { OAUTH_CONFIGS } from "@/lib/oauth-configs";
import { encrypt } from "@/lib/crypto";
import { eq, and } from "drizzle-orm";
import type { Platform } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { platform } = await params;
  const config = OAUTH_CONFIGS[platform as Platform];
  if (!config) {
    return NextResponse.redirect(
      new URL("/settings?error=unknown_platform", req.url)
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?error=${error}`, req.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?error=missing_params", req.url)
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(`oauth_state_${platform}`)?.value;

  if (state !== storedState) {
    return NextResponse.redirect(
      new URL("/settings?error=invalid_state", req.url)
    );
  }

  // Clean up cookies
  cookieStore.delete(`oauth_state_${platform}`);

  const clientId = process.env[config.clientIdEnv]!;
  const clientSecret = process.env[config.clientSecretEnv]!;
  const redirectUri = `${process.env.AUTH_URL}/api/platforms/${platform}/callback`;

  try {
    // Exchange code for tokens
    const tokenBody: Record<string, string> = {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
    };

    // PKCE verification
    if (config.usePKCE) {
      const codeVerifier = cookieStore.get(
        `oauth_verifier_${platform}`
      )?.value;
      if (codeVerifier) {
        tokenBody.code_verifier = codeVerifier;
        cookieStore.delete(`oauth_verifier_${platform}`);
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // Some platforms want Basic auth, others want client_secret in body
    if (platform === "x") {
      headers["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
    } else {
      tokenBody.client_secret = clientSecret;
    }

    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers,
      body: new URLSearchParams(tokenBody).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error(`Token exchange failed for ${platform}:`, errText);
      return NextResponse.redirect(
        new URL("/settings?error=token_exchange_failed", req.url)
      );
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in;

    // Fetch user profile to get platform account ID
    let platformAccountId = "unknown";
    let platformUsername = "";

    if (config.profileUrl) {
      try {
        const profileRes = await fetch(config.profileUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          // Extract ID/username based on platform
          if (platform === "x") {
            platformAccountId = profile.data?.id || "unknown";
            platformUsername = profile.data?.username || "";
          } else if (platform === "linkedin") {
            platformAccountId = profile.sub || "unknown";
            platformUsername = profile.name || "";
          } else if (platform === "youtube") {
            const channel = profile.items?.[0];
            platformAccountId = channel?.id || "unknown";
            platformUsername = channel?.snippet?.title || "";
          } else {
            platformAccountId = profile.id || profile.user_id || "unknown";
            platformUsername = profile.name || profile.username || "";
          }
        }
      } catch {
        // Non-critical — continue with default values
      }
    }

    // Upsert platform connection
    const existing = await db.query.platformConnections.findFirst({
      where: and(
        eq(platformConnections.userId, session.user.id),
        eq(platformConnections.platform, platform as Platform)
      ),
    });

    const connectionData = {
      userId: session.user.id,
      platform: platform as Platform,
      platformAccountId,
      platformUsername,
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : null,
      tokenExpiresAt: expiresIn
        ? new Date(Date.now() + expiresIn * 1000)
        : null,
      scopes: config.scopes.join(" "),
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(platformConnections)
        .set(connectionData)
        .where(eq(platformConnections.id, existing.id));
    } else {
      await db.insert(platformConnections).values({
        ...connectionData,
        connectedAt: new Date(),
      });
    }

    return NextResponse.redirect(
      new URL(`/settings?connected=${platform}`, req.url)
    );
  } catch (err) {
    console.error(`OAuth callback error for ${platform}:`, err);
    return NextResponse.redirect(
      new URL("/settings?error=callback_failed", req.url)
    );
  }
}
