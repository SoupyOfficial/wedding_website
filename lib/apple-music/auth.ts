import jwt from "jsonwebtoken";
import type { AppleMusicConfig } from "./config";

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get (or cache) a signed Apple Music developer token.
 */
export function getAppleMusicToken(config: AppleMusicConfig): string {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const expiresInSeconds = 15777000; // ~6 months

  const token = jwt.sign({}, config.privateKey.replace(/\\n/g, "\n"), {
    algorithm: "ES256",
    expiresIn: expiresInSeconds,
    issuer: config.teamId,
    header: {
      alg: "ES256",
      kid: config.keyId,
    },
  });

  cachedToken = {
    token,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };

  return token;
}
