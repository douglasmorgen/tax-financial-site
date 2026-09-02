import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/request-data";
import { createDownloadResponse } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/admin/documents/[id]/download">,
): Promise<Response> {
  const { id } = await params;

  if (!isUuid(id)) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  const document = await prisma.document.findUnique({
    where: {
      id,
    },
  });

  if (!document) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  try {
    return await createDownloadResponse(document.storageKey, document.fileName, document.contentType);
  } catch (error) {
    console.error("Failed to download admin document", error);
    return NextResponse.json({ message: "Unable to download document" }, { status: 500 });
  }
}
