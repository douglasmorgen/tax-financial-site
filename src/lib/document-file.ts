import { DocumentCategory, DocumentType } from "@/generated/prisma/enums";
import { randomUUID } from "node:crypto";
import type { SupportedDocumentContentType } from "@/lib/document-policy";
import { sanitizeFileName } from "@/lib/security";

const CONTENT_TYPE_EXTENSIONS = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
} as const satisfies Readonly<Record<SupportedDocumentContentType, string>>;

function getFileExtension(contentType: SupportedDocumentContentType): string {
  return CONTENT_TYPE_EXTENSIONS[contentType];
}

export function buildStoredFileName(params: {
  category: DocumentCategory;
  taxYear: number;
  type: DocumentType;
  contentType: SupportedDocumentContentType;
  returnType?: string | null;
  stateCode?: string | null;
}): string {
  const typeSlug = params.type === DocumentType.ADMIN_RETURN ? "completed-return" : "source-document";
  const categorySlug = params.category.toLowerCase();
  const extension = getFileExtension(params.contentType);
  const returnTypeSlug = params.returnType ? sanitizeFileName(params.returnType.toLowerCase()) : "";
  const stateSlug = params.stateCode ? sanitizeFileName(params.stateCode.toUpperCase()) : "";
  const uniqueSuffix = randomUUID().slice(0, 4);

  if (params.type === DocumentType.ADMIN_RETURN) {
    const label = returnTypeSlug || "finished-return";
    const statePart = stateSlug ? `-${stateSlug}` : "";
    return `${params.taxYear}-${label}${statePart}-${uniqueSuffix}.${extension}`;
  }

  const timestampSuffix = Date.now().toString().slice(-6);
  return `${params.taxYear}-${categorySlug}-${typeSlug}-${timestampSuffix}-${uniqueSuffix}.${extension}`;
}
