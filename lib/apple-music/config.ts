export interface AppleMusicConfig {
  teamId: string;
  keyId: string;
  privateKey: string;
}

/**
 * Check if Apple Music credentials are configured.
 */
export function isAppleMusicConfigured(): boolean {
  return !!(
    process.env.APPLE_MUSIC_TEAM_ID &&
    process.env.APPLE_MUSIC_KEY_ID &&
    process.env.APPLE_MUSIC_PRIVATE_KEY
  );
}

/**
 * Get Apple Music config from environment.
 * Throws if credentials are missing.
 */
export function getConfig(): AppleMusicConfig {
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;

  if (!teamId || !keyId || !privateKey) {
    throw new Error(
      "Apple Music credentials not configured. Set APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID, and APPLE_MUSIC_PRIVATE_KEY."
    );
  }

  return { teamId, keyId, privateKey };
}
