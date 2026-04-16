// Barrel re-export — all consumers import from "@/lib/apple-music"
export { getConfig, isAppleMusicConfigured } from "./config";
export type { AppleMusicConfig } from "./config";
export { getAppleMusicToken } from "./auth";
export { parsePlaylistUrl, fetchPlaylist } from "./client";
export { formatTrack } from "./formatter";
export type { PlaylistTrack, PlaylistInfo, AppleMusicTrack } from "./formatter";
