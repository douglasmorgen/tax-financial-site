import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentCategory, DocumentType } from "@/generated/prisma/enums";
import { buildStoredFileName } from "@/lib/document-file";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildStoredFileName", () => {
  it("builds an application-controlled client upload name", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_712_345_678_901);

    expect(
      buildStoredFileName({
        category: DocumentCategory.W2,
        taxYear: 2025,
        type: DocumentType.CLIENT_UPLOAD,
        contentType: "application/pdf",
      }),
    ).toMatch(/^2025-w2-source-document-678901-[0-9a-f]{4}\.pdf$/);

  });

  it("includes a normalized return type and state for administrator files", () => {
    expect(
      buildStoredFileName({
        category: DocumentCategory.COMPLETED_RETURN,
        taxYear: 2025,
        type: DocumentType.ADMIN_RETURN,
        contentType: "image/png",
        returnType: "Completed state return",
        stateCode: "ca",
      }),
    ).toMatch(/^2025-completed-state-return-CA-[0-9a-f]{4}\.png$/);
  });

  it("uses a stable fallback label when the return type is absent", () => {
    expect(
      buildStoredFileName({
        category: DocumentCategory.OTHER,
        taxYear: 2025,
        type: DocumentType.ADMIN_RETURN,
        contentType: "image/jpeg",
      }),
    ).toMatch(/^2025-finished-return-[0-9a-f]{4}\.jpg$/);
  });
});
