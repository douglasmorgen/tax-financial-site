import { describe, expect, it } from "vitest";
import {
  DOCUMENT_FILE_INPUT_ACCEPT,
  MAX_DOCUMENT_UPLOAD_BYTES,
  SUPPORTED_DOCUMENT_CONTENT_TYPES,
  isSupportedDocumentContentType,
} from "@/lib/document-policy";

describe("document policy", () => {
  it("allows each advertised document content type", () => {
    for (const contentType of SUPPORTED_DOCUMENT_CONTENT_TYPES) {
      expect(isSupportedDocumentContentType(contentType)).toBe(true);
    }

    expect(DOCUMENT_FILE_INPUT_ACCEPT).toBe(
      SUPPORTED_DOCUMENT_CONTENT_TYPES.join(","),
    );
  });

  it("rejects content types outside the allowlist", () => {
    expect(isSupportedDocumentContentType("text/html")).toBe(false);
    expect(isSupportedDocumentContentType("application/octet-stream")).toBe(false);
  });

  it("caps uploads at 25 MiB", () => {
    expect(MAX_DOCUMENT_UPLOAD_BYTES).toBe(25 * 1024 * 1024);
  });
});
