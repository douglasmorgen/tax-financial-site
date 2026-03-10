import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export type AuthenticatedClient = {
  id: string;
  name: string;
  email: string;
  address: string | null;
  phoneNumber: string | null;
};

async function resolveClientRecord() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    return null;
  }

  const existingClient = await prisma.client.findUnique({
    where: {
      email: primaryEmail.toLowerCase(),
    },
  });

  if (existingClient) {
    if (!existingClient.emailVerifiedAt) {
      return prisma.client.update({
        where: {
          id: existingClient.id,
        },
        data: {
          emailVerifiedAt: new Date(),
        },
      });
    }

    return existingClient;
  }

  const fallbackName =
    user?.fullName?.trim() ||
    primaryEmail.split("@")[0];

  return prisma.client.create({
    data: {
      name: fallbackName,
      email: primaryEmail.toLowerCase(),
      address: null,
      phoneNumber: null,
      emailVerifiedAt: new Date(),
    },
  });
}

export async function getAuthenticatedClient(): Promise<AuthenticatedClient | null> {
  const client = await resolveClientRecord();

  if (!client) {
    return null;
  }

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    address: client.address,
    phoneNumber: client.phoneNumber,
  };
}

export async function requireAuthenticatedClient(): Promise<AuthenticatedClient> {
  const client = await getAuthenticatedClient();

  if (!client) {
    redirect("/portal/login");
  }

  return client;
}
