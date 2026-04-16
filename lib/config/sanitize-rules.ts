/**
 * Sanitization rule configuration.
 * Controls which HTML tags and attributes are allowed in rich text content.
 * Extend by creating a new SanitizeRules object — no need to modify sanitizeHtml.
 */

export interface SanitizeRules {
  allowedTags: Set<string>;
  allowedAttrs: Record<string, Set<string>>;
}

export const defaultSanitizeRules: SanitizeRules = {
  allowedTags: new Set([
    "p", "br", "b", "i", "em", "strong", "u", "a", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "span", "div",
  ]),
  allowedAttrs: {
    a: new Set(["href", "title", "target", "rel"]),
    span: new Set(["class"]),
    div: new Set(["class"]),
  },
};
