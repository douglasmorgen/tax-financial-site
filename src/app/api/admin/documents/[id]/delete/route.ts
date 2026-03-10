import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteDocumentFromStorage } from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: {
      id,
    },
  });

  if (!document) {
    return NextResponse.redirect(new URL("/admin?error=document-not-found", request.url), 303);
  }

  try {
    await deleteDocumentFromStorage(document.storageKey);
    await prisma.document.delete({
      where: {
        id: document.id,
      },
    });

    return NextResponse.redirect(
      new URL(`/admin?taxYear=${document.taxYear}&success=document-deleted`, request.url),
      303,
    );
  } catch (error) {
    console.error("Failed to delete admin document", error);
    return NextResponse.redirect(
      new URL(`/admin?taxYear=${document.taxYear}&error=document-delete-failed`, request.url),
      303,
    );
  }
}
