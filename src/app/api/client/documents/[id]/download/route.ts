import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { createDownloadResponse } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const client = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
    return await createDownloadResponse(document.storageKey, document.fileName, document.contentType);
  } catch (error) {
    console.error("Failed to download client document", error);
    return NextResponse.json({ message: "Unable to download document" }, { status: 500 });
  }
}
