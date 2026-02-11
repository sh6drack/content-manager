import { db } from "@/db";
import { platformConnections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";
import { OAUTH_CONFIGS } from "@/lib/oauth-configs";
import type { Platform } from "@/lib/constants";

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 min before expiry

/**
 * Returns a valid (non-expired) access token for a platform connection.
 * If the token is about to expire and a refresh token exists, it refreshes first.
 */
export async function getValidToken(connectionId: string): Promise<string> {
  const connection = await db.query.platformConnections.findFirst({
    where: eq(platformConnections.id, connectionId),
  });

  if (!connection) {
    throw new Error(`Platform connection ${connectionId} not found`);
  }

  const accessToken = decrypt(connection.accessToken);

  // If no expiry set, or token is still valid, return it
  if (
    !connection.tokenExpiresAt ||
    connection.tokenExpiresAt.getTime() > Date.now() + TOKEN_REFRESH_BUFFER_MS
  ) {
    return accessToken;
  }

  // Token is expired or about to expire — try refreshing
  if (!connection.refreshToken) {
    throw new Error(
      `Token expired for ${connection.platform} and no refresh token available. Please reconnect.`
    );
  }

  const refreshToken = decrypt(connection.refreshToken);
  const config = OAUTH_CONFIGS[connection.platform as Platform];

  if (!config) {
    throw new Error(`No OAuth config for platform: ${connection.platform}`);
  }

  const clientId = process.env[config.clientIdEnv]!;
  const clientSecret = process.env[config.clientSecretEnv]!;

  const body: Record<string, string> = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  // X uses Basic auth for token requests
  if (connection.platform === "x") {
    headers["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  } else {
    body.client_secret = clientSecret;
  }

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers,
    body: new URLSearchParams(body).toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(
      `Token refresh failed for ${connection.platform}:`,
      errText
    );
    throw new Error(
      `Token refresh failed for ${connection.platform}. Please reconnect.`
    );
  }

  const tokens = await res.json();
  const newAccessToken = tokens.access_token;
  const newRefreshToken = tokens.refresh_token;
  const expiresIn = tokens.expires_in;

  // Update DB with new tokens
  await db
    .update(platformConnections)
    .set({
      accessToken: encrypt(newAccessToken),
      refreshToken: newRefreshToken
        ? encrypt(newRefreshToken)
        : connection.refreshToken, // Keep old refresh token if new one isn't provided
      tokenExpiresAt: expiresIn
        ? new Date(Date.now() + expiresIn * 1000)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(platformConnections.id, connectionId));

  return newAccessToken;
}
