import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const client = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.redirect(new URL("/portal/login", request.url), 303);
  }

  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim() || "";
  const address = formData.get("address")?.toString().trim() || null;
  const phoneNumber = formData.get("phoneNumber")?.toString().trim() || null;

  if (!name) {
    return NextResponse.redirect(new URL("/portal?tab=profile&error=missing-profile-name", request.url), 303);
  }

  await prisma.client.update({
    where: {
      id: client.id,
    },
    data: {
      name,
      address,
      phoneNumber,
    },
  });

  return NextResponse.redirect(new URL("/portal?tab=profile&success=profile-updated", request.url), 303);
}
