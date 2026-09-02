import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/request-data";
import { deleteDocumentFromStorage } from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: RouteContext<"/api/admin/documents/[id]/delete">,
): Promise<Response> {
  const { id } = await params;

  if (!isUuid(id)) {
    return NextResponse.redirect(new URL("/admin?error=document-not-found", request.url), 303);
  }

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
