import { describe, expect, it } from "vitest";
import { DocumentCategory } from "@/generated/prisma/enums";
import {
  ADMIN_DOCUMENT_CATEGORIES,
  CLIENT_DOCUMENT_CATEGORIES,
  doesReturnTypeRequireState,
  getDefaultTaxYear,
  getDocumentCategoryLabel,
  getTaxYearChoices,
  isAdminDocumentCategory,
  isClientDocumentCategory,
  isFinishedReturnType,
  isSupportedTaxYear,
  isUSStateCode,
} from "@/lib/document-options";

describe("document category options", () => {
  it("keeps client and administrator category guards scoped", () => {
    expect(isClientDocumentCategory(DocumentCategory.W2)).toBe(true);
    expect(isClientDocumentCategory(DocumentCategory.COMPLETED_RETURN)).toBe(false);
    expect(isAdminDocumentCategory(DocumentCategory.COMPLETED_RETURN)).toBe(true);
    expect(isAdminDocumentCategory(DocumentCategory.W2)).toBe(false);
    expect(isAdminDocumentCategory("UNKNOWN")).toBe(false);
  });

  it("provides a non-empty label for every configured category", () => {
    const categories = new Set([
      ...CLIENT_DOCUMENT_CATEGORIES,
      ...ADMIN_DOCUMENT_CATEGORIES,
    ]);

    for (const category of categories) {
      expect(getDocumentCategoryLabel(category)).not.toHaveLength(0);
    }
  });
});

describe("finished return options", () => {
  it("validates return types and state requirements", () => {
    expect(isFinishedReturnType("Completed federal return")).toBe(true);
    expect(isFinishedReturnType("Unknown return")).toBe(false);
    expect(doesReturnTypeRequireState("Completed state return")).toBe(true);
    expect(doesReturnTypeRequireState("Completed federal return")).toBe(false);
  });

  it("validates postal state codes", () => {
    expect(isUSStateCode("CA")).toBe(true);
    expect(isUSStateCode("ca")).toBe(false);
    expect(isUSStateCode("XX")).toBe(false);
  });
});

describe("tax year choices", () => {
  it("uses the prior tax year through June", () => {
    const date = new Date(2026, 5, 30);

    expect(getDefaultTaxYear(date)).toBe(2025);
    expect(getTaxYearChoices(date)).toEqual([2026, 2025, 2024, 2023]);
  });

  it("uses the current tax year beginning in July", () => {
    const date = new Date(2026, 6, 1);

    expect(getDefaultTaxYear(date)).toBe(2026);
    expect(isSupportedTaxYear(2027, date)).toBe(true);
    expect(isSupportedTaxYear(2022, date)).toBe(false);
  });
});
