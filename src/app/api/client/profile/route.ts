import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { readFormString } from "@/lib/request-data";

export async function POST(request: Request): Promise<NextResponse> {
  const client = await getAuthenticatedClient();

  if (!client) {
    return NextResponse.redirect(new URL("/portal/login", request.url), 303);
  }

  const formData = await request.formData();
  const name = readFormString(formData, "name");
  const addressValue = readFormString(formData, "address");
  const phoneNumberValue = readFormString(formData, "phoneNumber");
  const address = addressValue || null;
  const phoneNumber = phoneNumberValue || null;

  if (!name) {
    return NextResponse.redirect(new URL("/portal?tab=profile&error=missing-profile-name", request.url), 303);
  }

  if (
    name.length > 120 ||
    (addressValue && addressValue.length > 1_000) ||
    (phoneNumberValue && phoneNumberValue.length > 50)
  ) {
    return NextResponse.redirect(new URL("/portal?tab=profile&error=invalid-profile", request.url), 303);
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
