import { DocumentCategory, DocumentType } from "@prisma/client";

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
}) {
  const typeSlug = params.type === DocumentType.ADMIN_RETURN ? "completed-return" : "source-document";
  const categorySlug = params.category.toLowerCase();
  const extension = getFileExtension(params.contentType);

  return `${params.taxYear}-${categorySlug}-${typeSlug}.${extension}`;
}
