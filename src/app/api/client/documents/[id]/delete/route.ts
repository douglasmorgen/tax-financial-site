import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/request-data";
import { deleteDocumentFromStorage } from "@/lib/storage";

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/client/documents/[id]/delete">,
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
    await deleteDocumentFromStorage(document.storageKey);
    await prisma.document.delete({
      where: {
        id: document.id,
      },
    });

    return NextResponse.json({ success: true, taxYear: document.taxYear });
  } catch (error) {
    console.error("Failed to delete client document", error);
    return NextResponse.json({ message: "Unable to delete document" }, { status: 500 });
  }
}
