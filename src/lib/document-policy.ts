export const MAX_DOCUMENT_UPLOAD_BYTES = 25 * 1024 * 1024;

export const SUPPORTED_DOCUMENT_CONTENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;

export type SupportedDocumentContentType =
  (typeof SUPPORTED_DOCUMENT_CONTENT_TYPES)[number];

const SUPPORTED_DOCUMENT_CONTENT_TYPE_SET: ReadonlySet<string> = new Set(
  SUPPORTED_DOCUMENT_CONTENT_TYPES,
);

export const DOCUMENT_FILE_INPUT_ACCEPT = SUPPORTED_DOCUMENT_CONTENT_TYPES.join(",");

export function isSupportedDocumentContentType(
  value: string,
): value is SupportedDocumentContentType {
  return SUPPORTED_DOCUMENT_CONTENT_TYPE_SET.has(value);
}
