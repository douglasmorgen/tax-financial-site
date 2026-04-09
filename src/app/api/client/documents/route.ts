import { NextResponse } from "next/server";
import { DocumentCategory, DocumentType } from "@prisma/client";
import { getAuthenticatedClient } from "@/lib/client-auth";
import { CLIENT_DOCUMENT_CATEGORIES } from "@/lib/document-options";
import { buildStoredFileName } from "@/lib/document-file";
import { prisma } from "@/lib/prisma";
import { uploadDocumentToStorage } from "@/lib/storage";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function portalRedirect(request: Request, taxYear: number, status: string, value: string) {
  const url = new URL("/portal", request.url);
  url.searchParams.set("tab", "upload");
  url.searchParams.set("taxYear", String(taxYear));
  url.searchParams.set(status, value);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const client = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.redirect(new URL("/portal/login", request.url), 303);
  }

  const formData = await request.formData();
  const category = formData.get("category")?.toString() as DocumentCategory | undefined;
  const taxYear = Number.parseInt(formData.get("taxYear")?.toString() || "", 10);
  const issuerName = formData.get("issuerName")?.toString().trim() || null;
  const file = formData.get("file");

  if (!category || !Number.isInteger(taxYear) || !(file instanceof File)) {
    return portalRedirect(request, taxYear, "error", "missing-file");
  }

  if (!CLIENT_DOCUMENT_CATEGORIES.includes(category)) {
    return portalRedirect(request, taxYear, "error", "invalid-document-category");
  }

  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return portalRedirect(request, taxYear, "error", "invalid-file-size");
  }

  try {
    const contentType = file.type || "application/octet-stream";
    const storedFileName = buildStoredFileName({
      category,
      taxYear,
      type: DocumentType.CLIENT_UPLOAD,
      contentType,
      originalFileName: file.name,
    });

    const storageKey = await uploadDocumentToStorage({
      clientId: client.id,
      contentType,
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
        contentType,
        sizeBytes: file.size,
        storageKey,
        uploadedBy: client.email,
      },
    });

    return portalRedirect(request, taxYear, "success", "document-uploaded");
  } catch (error) {
    console.error("Failed to upload client document", error);
    return portalRedirect(request, taxYear, "error", "document-upload-failed");
  }
}
