export const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "m4v"] as const;

export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
] as const;

const VIDEO_URL_RE = /\.(mp4|mov|webm|m4v)([?#].*)?$/i;

export function isVideoUrl(url: string): boolean {
  return VIDEO_URL_RE.test(url);
}
