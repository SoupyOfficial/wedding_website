import { describe, it, expect } from "vitest";
import { escapeHtml, sanitizeHtml, isValidUrl, safeUrl } from "@/lib/sanitize";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<div>hi</div>")).toBe("&lt;div&gt;hi&lt;/div&gt;");
  });

  it("escapes quotes", () => {
    expect(escapeHtml('"hello" & \'world\'')).toBe(
      "&quot;hello&quot; &amp; &#x27;world&#x27;"
    );
  });

  it("returns empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("leaves safe strings unchanged", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
  });

  it("escapes multiple special chars in sequence", () => {
    expect(escapeHtml("<>&\"'")).toBe("&lt;&gt;&amp;&quot;&#x27;");
  });
});

describe("sanitizeHtml", () => {
  it("removes script tags and their content", () => {
    expect(sanitizeHtml('<script>alert("xss")</script>Hello')).toBe("Hello");
  });

  it("removes event handler attributes", () => {
    const result = sanitizeHtml('<div onclick="alert(1)">text</div>');
    expect(result).not.toContain("onclick");
    expect(result).toContain("text");
  });

  it("removes javascript: URLs", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain("javascript:");
  });

  it("removes data: URLs", () => {
    const result = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>');
    expect(result).not.toContain("data:");
  });

  it("strips disallowed tags but keeps text", () => {
    expect(sanitizeHtml("<iframe>content</iframe>")).toBe("content");
  });

  it("preserves allowed tags", () => {
    const input = "<p>Hello <strong>world</strong></p>";
    const result = sanitizeHtml(input);
    expect(result).toContain("<p>");
    expect(result).toContain("<strong>");
    expect(result).toContain("</p>");
  });

  it("strips disallowed attributes from allowed tags", () => {
    const result = sanitizeHtml('<div style="color:red" class="ok">text</div>');
    expect(result).not.toContain("style");
    expect(result).toContain('class="ok"');
  });

  it("forces rel='noopener noreferrer' on anchor tags", () => {
    const result = sanitizeHtml('<a href="https://example.com">link</a>');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it("replaces existing rel attribute on anchor tags", () => {
    const result = sanitizeHtml('<a href="https://x.com" rel="nofollow">link</a>');
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).not.toContain("nofollow");
  });

  it("handles onerror event handlers", () => {
    const result = sanitizeHtml('<img onerror="alert(1)" src="x.jpg">');
    expect(result).not.toContain("onerror");
  });

  it("handles self-closing tags", () => {
    const result = sanitizeHtml("<br/>");
    expect(result).toContain("br");
  });
});

describe("isValidUrl", () => {
  it("accepts http URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("accepts https URLs", () => {
    expect(isValidUrl("https://example.com/page")).toBe(true);
  });

  it("accepts mailto URLs", () => {
    expect(isValidUrl("mailto:test@example.com")).toBe(true);
  });

  it("rejects javascript: URLs", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data: URLs", () => {
    expect(isValidUrl("data:text/html,<h1>hi</h1>")).toBe(false);
  });

  it("rejects ftp URLs", () => {
    expect(isValidUrl("ftp://files.example.com")).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });
});

describe("safeUrl", () => {
  it("returns valid URL unchanged", () => {
    expect(safeUrl("https://example.com")).toBe("https://example.com");
  });

  it("returns fallback for invalid URL", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("#");
  });

  it("returns custom fallback for invalid URL", () => {
    expect(safeUrl("bad-url", "/home")).toBe("/home");
  });

  it("returns fallback for empty string", () => {
    expect(safeUrl("")).toBe("#");
  });
});
