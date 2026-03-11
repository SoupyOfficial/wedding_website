/**
 * HTML sanitization utilities.
 * Escapes user-submitted text to prevent XSS attacks.
 * For rich text content (e.g. ourStoryContent), strips dangerous tags/attributes.
 */

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

// Tags allowed in rich text content (ourStoryContent)
const ALLOWED_TAGS = new Set([
  "p", "br", "b", "i", "em", "strong", "u", "a", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "span", "div",
]);

// Attributes allowed on tags
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  span: new Set(["class"]),
  div: new Set(["class"]),
};

/**
 * Sanitize rich HTML content by stripping dangerous tags and attributes.
 * Allows only a safe subset of structural + formatting tags.
 */
export function sanitizeHtml(html: string): string {
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
    if (!ALLOWED_TAGS.has(tag)) return "";

    // For allowed tags, strip disallowed attributes
    if (match.startsWith("</")) return `</${tag}>`;

    const allowedAttrs = ALLOWED_ATTRS[tag] || new Set<string>();
    // Extract attributes and filter
    const attrsMatch = match.match(/\s+([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g) || [];
    const safeAttrs = attrsMatch
      .filter((attr) => {
        const nameMatch = attr.match(/^\s*([a-zA-Z-]+)/);
        if (!nameMatch) return false;
        return allowedAttrs.has(nameMatch[1].toLowerCase());
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
