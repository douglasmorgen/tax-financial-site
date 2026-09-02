import { NextResponse } from "next/server";
import { DocumentType } from "@/generated/prisma/enums";
import {
  doesReturnTypeRequireState,
  getDefaultTaxYear,
  isAdminDocumentCategory,
  isFinishedReturnType,
  isSupportedTaxYear,
  isUSStateCode,
} from "@/lib/document-options";
import { buildStoredFileName } from "@/lib/document-file";
import {
  isSupportedDocumentContentType,
  MAX_DOCUMENT_UPLOAD_BYTES,
} from "@/lib/document-policy";
import { prisma } from "@/lib/prisma";
import { isUuid, parseInteger, readFormFile, readFormString } from "@/lib/request-data";
import {
  deleteDocumentFromStorage,
  uploadDocumentToStorage,
} from "@/lib/storage";

type ActionStatus = "error" | "success";

function adminRedirect(request: Request, taxYear: number, status: ActionStatus, value: string): NextResponse {
  const url = new URL("/admin", request.url);
  url.searchParams.set("taxYear", String(taxYear));
  url.searchParams.set(status, value);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const clientId = readFormString(formData, "clientId");
  const category = readFormString(formData, "category");
  const taxYear = parseInteger(readFormString(formData, "taxYear"));
  const returnType = readFormString(formData, "returnType");
  const stateCode = readFormString(formData, "stateCode")?.toUpperCase() ?? "";
  const file = readFormFile(formData, "file");
  const redirectTaxYear = taxYear ?? getDefaultTaxYear();

  if (!clientId || !category || taxYear === null || !returnType || !file) {
    return adminRedirect(request, redirectTaxYear, "error", "missing-document-fields");
  }

  if (!isUuid(clientId)) {
    return adminRedirect(request, redirectTaxYear, "error", "invalid-client");
  }

  if (!isAdminDocumentCategory(category)) {
    return adminRedirect(request, taxYear, "error", "invalid-document-category");
  }

  if (!isSupportedTaxYear(taxYear)) {
    return adminRedirect(request, redirectTaxYear, "error", "invalid-tax-year");
  }

  if (file.size === 0 || file.size > MAX_DOCUMENT_UPLOAD_BYTES) {
    return adminRedirect(request, taxYear, "error", "invalid-document-size");
  }

  if (!isSupportedDocumentContentType(file.type)) {
    return adminRedirect(request, taxYear, "error", "invalid-document-type");
  }

  if (!isFinishedReturnType(returnType)) {
    return adminRedirect(request, taxYear, "error", "invalid-return-type");
  }

  const requiresState = doesReturnTypeRequireState(returnType);

  if (requiresState && (!stateCode || !isUSStateCode(stateCode))) {
    return adminRedirect(request, taxYear, "error", "invalid-state");
  }

  const normalizedStateCode = requiresState ? stateCode : null;
  let storageKey: string | null = null;

  try {
    const storedFileName = buildStoredFileName({
      category,
      taxYear,
      type: DocumentType.ADMIN_RETURN,
      contentType: file.type,
      returnType,
      stateCode: normalizedStateCode,
    });

    storageKey = await uploadDocumentToStorage({
      clientId,
      contentType: file.type,
      fileBuffer: Buffer.from(await file.arrayBuffer()),
      folder: "admin-returns",
    });

    await prisma.document.create({
      data: {
        clientId,
        type: DocumentType.ADMIN_RETURN,
        category,
        taxYear,
        issuerName: normalizedStateCode,
        documentLabel: returnType,
        fileName: storedFileName,
        contentType: file.type,
        sizeBytes: file.size,
        storageKey,
        uploadedBy: "admin",
      },
    });

    return adminRedirect(request, taxYear, "success", "return-uploaded");
  } catch (error) {
    console.error("Failed to upload admin document", error);

    if (storageKey) {
      await deleteDocumentFromStorage(storageKey).catch((cleanupError: unknown) => {
        console.error("Failed to clean up orphaned admin upload", cleanupError);
      });
    }

    return adminRedirect(request, taxYear, "error", "document-upload-failed");
  }
}
