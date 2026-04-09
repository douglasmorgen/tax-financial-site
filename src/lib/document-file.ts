import { DocumentCategory, DocumentType } from "@prisma/client";
import { randomUUID } from "crypto";
import { sanitizeFileName } from "@/lib/security";

const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

function getFileExtension(contentType: string) {
  const normalizedType = contentType.toLowerCase().trim();
  return CONTENT_TYPE_EXTENSIONS[normalizedType] || "bin";
}

export function buildStoredFileName(params: {
  category: DocumentCategory;
  taxYear: number;
  type: DocumentType;
  contentType: string;
  originalFileName?: string;
  returnType?: string | null;
  stateCode?: string | null;
}) {
  const typeSlug = params.type === DocumentType.ADMIN_RETURN ? "completed-return" : "source-document";
  const categorySlug = params.category.toLowerCase();
  const extension = getFileExtension(params.contentType);
  const baseName = params.originalFileName
    ? sanitizeFileName(params.originalFileName.replace(/\.[^/.]+$/, ""))
    : "document";
  const returnTypeSlug = params.returnType ? sanitizeFileName(params.returnType.toLowerCase()) : "";
  const stateSlug = params.stateCode ? sanitizeFileName(params.stateCode.toLowerCase()) : "";
  const timestampSuffix = Date.now().toString().slice(-6);
  const uniqueSuffix = randomUUID().slice(0, 8);
  const metadataSlug = [returnTypeSlug, stateSlug].filter(Boolean).join("-");
  const fileNameCore = metadataSlug
    ? `${params.taxYear}-${categorySlug}-${metadataSlug}-${baseName}-${typeSlug}`
    : `${params.taxYear}-${categorySlug}-${baseName}-${typeSlug}`;

  return `${fileNameCore}-${timestampSuffix}-${uniqueSuffix}.${extension}`;
}
