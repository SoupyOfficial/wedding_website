export interface AppleMusicTrack {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    artwork?: { url: string; width: number; height: number };
    previews?: Array<{ url: string }>;
  };
}

export interface PlaylistTrack {
  songName: string;
  artist: string;
  album: string;
  durationMs: number;
  artworkUrl?: string;
  previewUrl?: string;
}

export interface PlaylistInfo {
  name: string;
  description?: string;
  curatorName?: string;
  tracks: PlaylistTrack[];
}

/**
 * Format a raw Apple Music track into our domain shape.
 */
export function formatTrack(track: AppleMusicTrack): PlaylistTrack {
  const artworkUrl = track.attributes.artwork?.url
    ?.replace("{w}", "100")
    .replace("{h}", "100");

  return {
    songName: track.attributes.name,
    artist: track.attributes.artistName,
    album: track.attributes.albumName,
    durationMs: track.attributes.durationInMillis,
    artworkUrl,
    previewUrl: track.attributes.previews?.[0]?.url,
  };
}
