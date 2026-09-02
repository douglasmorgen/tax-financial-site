import { NextResponse } from "next/server";
import { DocumentType } from "@/generated/prisma/enums";
import { getAuthenticatedClient } from "@/lib/client-auth";
import {
  getDefaultTaxYear,
  isClientDocumentCategory,
  isSupportedTaxYear,
} from "@/lib/document-options";
import { buildStoredFileName } from "@/lib/document-file";
import {
  isSupportedDocumentContentType,
  MAX_DOCUMENT_UPLOAD_BYTES,
} from "@/lib/document-policy";
import { prisma } from "@/lib/prisma";
import { parseInteger, readFormFile, readFormString } from "@/lib/request-data";
import {
  deleteDocumentFromStorage,
  uploadDocumentToStorage,
} from "@/lib/storage";

type ActionStatus = "error" | "success";

function portalRedirect(request: Request, taxYear: number, status: ActionStatus, value: string): NextResponse {
  const url = new URL("/portal", request.url);
  url.searchParams.set("tab", "upload");
  url.searchParams.set("taxYear", String(taxYear));
  url.searchParams.set(status, value);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request): Promise<NextResponse> {
  const client = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.redirect(new URL("/portal/login", request.url), 303);
  }

  const formData = await request.formData();
  const category = readFormString(formData, "category");
  const taxYear = parseInteger(readFormString(formData, "taxYear"));
  const issuerNameValue = readFormString(formData, "issuerName");
  const issuerName = issuerNameValue || null;
  const file = readFormFile(formData, "file");
  const redirectTaxYear = taxYear ?? getDefaultTaxYear();

  if (!category || taxYear === null || !file) {
    return portalRedirect(request, redirectTaxYear, "error", "missing-file");
  }

  if (!isClientDocumentCategory(category)) {
    return portalRedirect(request, taxYear, "error", "invalid-document-category");
  }

  if (!isSupportedTaxYear(taxYear)) {
    return portalRedirect(request, redirectTaxYear, "error", "invalid-tax-year");
  }

  if (issuerNameValue && issuerNameValue.length > 120) {
    return portalRedirect(request, taxYear, "error", "invalid-issuer-name");
  }

  if (file.size === 0 || file.size > MAX_DOCUMENT_UPLOAD_BYTES) {
    return portalRedirect(request, taxYear, "error", "invalid-file-size");
  }

  if (!isSupportedDocumentContentType(file.type)) {
    return portalRedirect(request, taxYear, "error", "invalid-file-type");
  }

  let storageKey: string | null = null;

  try {
    const storedFileName = buildStoredFileName({
      category,
      taxYear,
      type: DocumentType.CLIENT_UPLOAD,
      contentType: file.type,
    });

    storageKey = await uploadDocumentToStorage({
      clientId: client.id,
      contentType: file.type,
      fileBuffer: Buffer.from(await file.arrayBuffer()),
      folder: "client-uploads",
    });

    await prisma.document.create({
      data: {
        clientId: client.id,
        type: DocumentType.CLIENT_UPLOAD,
        category,
        taxYear,
        issuerName,
        fileName: storedFileName,
        contentType: file.type,
        sizeBytes: file.size,
        storageKey,
        uploadedBy: client.email,
      },
    });

    return portalRedirect(request, taxYear, "success", "document-uploaded");
  } catch (error) {
    console.error("Failed to upload client document", error);

    if (storageKey) {
      await deleteDocumentFromStorage(storageKey).catch((cleanupError: unknown) => {
        console.error("Failed to clean up orphaned client upload", cleanupError);
      });
    }

    return portalRedirect(request, taxYear, "error", "document-upload-failed");
  }
}
