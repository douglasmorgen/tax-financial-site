import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/request-data";
import { createInlineViewResponse } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/client/documents/[id]/view">,
): Promise<Response> {
  const client = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!isUuid(id)) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  const document = await prisma.document.findFirst({
    where: {
      id,
      clientId: client.id,
    },
  });

  if (!document) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  try {
    return await createInlineViewResponse(document.storageKey, document.fileName, document.contentType);
  } catch (error) {
    console.error("Failed to view client document", error);
    return NextResponse.json({ message: "Unable to view document" }, { status: 500 });
  }
}
