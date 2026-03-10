import { NextResponse } from "next/server";
import { DocumentCategory, DocumentType } from "@prisma/client";
import { ADMIN_DOCUMENT_CATEGORIES } from "@/lib/document-options";
import { buildStoredFileName } from "@/lib/document-file";
import { prisma } from "@/lib/prisma";
import { uploadDocumentToStorage } from "@/lib/storage";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function adminRedirect(request: Request, taxYear: number, status: string, value: string) {
  const url = new URL("/admin", request.url);
  url.searchParams.set("taxYear", String(taxYear));
  url.searchParams.set(status, value);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const clientId = formData.get("clientId")?.toString() || "";
  const category = formData.get("category")?.toString() as DocumentCategory | undefined;
  const taxYear = Number.parseInt(formData.get("taxYear")?.toString() || "", 10);
  const issuerName = formData.get("issuerName")?.toString().trim() || null;
  const file = formData.get("file");

  if (!clientId || !category || !Number.isInteger(taxYear) || !(file instanceof File)) {
    return adminRedirect(request, taxYear, "error", "missing-document-fields");
  }

  if (!ADMIN_DOCUMENT_CATEGORIES.includes(category)) {
    return adminRedirect(request, taxYear, "error", "invalid-document-category");
  }

  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return adminRedirect(request, taxYear, "error", "invalid-document-size");
  }

  try {
    const contentType = file.type || "application/octet-stream";
    const storedFileName = buildStoredFileName({
      category,
      taxYear,
      type: DocumentType.ADMIN_RETURN,
      contentType,
    });

    const storageKey = await uploadDocumentToStorage({
      clientId,
      contentType,
      fileBuffer: Buffer.from(await file.arrayBuffer()),
      folder: "admin-returns",
    });

    await prisma.document.create({
      data: {
        clientId,
        type: DocumentType.ADMIN_RETURN,
        category,
        taxYear,
        issuerName,
        fileName: storedFileName,
        contentType,
        sizeBytes: file.size,
        storageKey,
        uploadedBy: "admin",
      },
    });

    return adminRedirect(request, taxYear, "success", "return-uploaded");
  } catch (error) {
    console.error("Failed to upload admin document", error);
    return adminRedirect(request, taxYear, "error", "document-upload-failed");
  }
}
