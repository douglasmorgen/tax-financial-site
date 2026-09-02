import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/request-data";
import { createInlineViewResponse } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/admin/documents/[id]/view">,
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
    return await createInlineViewResponse(document.storageKey, document.fileName, document.contentType);
  } catch (error) {
    console.error("Failed to view admin document", error);
    return NextResponse.json({ message: "Unable to view document" }, { status: 500 });
  }
}
