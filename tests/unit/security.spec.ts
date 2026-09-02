import { describe, expect, it } from "vitest";
import { escapeHtml, sanitizeFileName, secureCompare } from "@/lib/security";

describe("sanitizeFileName", () => {
  it("removes unsafe characters and normalizes separators", () => {
    expect(sanitizeFileName("  ../../Client Return (Final).pdf  ")).toBe(
      "..-..-Client-Return-Final-.pdf",
    );
  });

  it("can return an empty name when no safe characters remain", () => {
    expect(sanitizeFileName("🔥🔥")).toBe("");
  });
});

describe("secureCompare", () => {
  it("compares equal and unequal credential strings", () => {
    expect(secureCompare("Basic dXNlcjpwYXNz", "Basic dXNlcjpwYXNz")).toBe(true);
    expect(secureCompare("Basic dXNlcjpwYXNz", "Basic b3RoZXI6cGFzcw==")).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapes every HTML-significant character", () => {
    expect(escapeHtml(`<a href="test">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;test&quot;&gt;Tom &amp; Jerry&#039;s&lt;/a&gt;",
    );
  });
});
