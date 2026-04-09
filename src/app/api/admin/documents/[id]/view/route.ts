import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createInlineViewResponse } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
