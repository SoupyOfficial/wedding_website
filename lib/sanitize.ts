/**
 * HTML sanitization utilities.
 * Escapes user-submitted text to prevent XSS attacks.
 * For rich text content (e.g. ourStoryContent), strips dangerous tags/attributes.
 */

import { defaultSanitizeRules, type SanitizeRules } from "@/lib/config/sanitize-rules";

export type { SanitizeRules } from "@/lib/config/sanitize-rules";

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

const ESCAPE_RE = /[&<>"']/g;

/**
 * Escape HTML entities in user-submitted plain text.
 * Use for guest book entries, music requests, contact messages, etc.
 */
export function escapeHtml(str: string): string {
  return str.replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch]);
}

/**
 * Sanitize rich HTML content by stripping dangerous tags and attributes.
 * Allows only a safe subset of structural + formatting tags.
 * Pass custom rules to allow different tag/attribute sets (OCP).
 */
export function sanitizeHtml(html: string, rules: SanitizeRules = defaultSanitizeRules): string {
  const { allowedTags, allowedAttrs } = rules;
  // Remove script tags and their contents entirely
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handler attributes (onclick, onerror, etc.)
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Remove javascript: and data: URLs in href/src
  cleaned = cleaned.replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, "$1=\"\"");
  cleaned = cleaned.replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, "$1=\"\"");

  // Strip disallowed tags but keep their text content
  cleaned = cleaned.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName: string) => {
    const tag = tagName.toLowerCase();
    if (!allowedTags.has(tag)) return "";

    // For allowed tags, strip disallowed attributes
    if (match.startsWith("</")) return `</${tag}>`;

    const tagAttrs = allowedAttrs[tag] || new Set<string>();
    // Extract attributes and filter
    const attrsMatch = match.match(/\s+([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g) || [];
    const safeAttrs = attrsMatch
      .filter((attr) => {
        const nameMatch = attr.match(/^\s*([a-zA-Z-]+)/);
        if (!nameMatch) return false;
        return tagAttrs.has(nameMatch[1].toLowerCase());
      })
      .map((attr) => {
        // Ensure 'a' tags with href get rel="noopener noreferrer" treatment
        return attr;
      });

    const selfClosing = match.endsWith("/>") ? " /" : "";
    return `<${tag}${safeAttrs.join("")}${selfClosing}>`;
  });

  // Force rel="noopener noreferrer" on all <a> tags
  cleaned = cleaned.replace(/<a\b([^>]*)>/g, (match, attrs: string) => {
    const withoutRel = attrs.replace(/\s*rel\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi, "");
    return `<a${withoutRel} rel="noopener noreferrer">`;
  });

  return cleaned;
}

/**
 * Validate a URL for safe use in href attributes.
 * Only allows http:, https:, and mailto: protocols.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Return the URL if valid, otherwise return a fallback.
 */
export function safeUrl(url: string, fallback = "#"): string {
  return isValidUrl(url) ? url : fallback;
}
