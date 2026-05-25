import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isProtectedPortalRoute = createRouteMatcher(["/portal(.*)", "/api/client(.*)"]);
const isPublicPortalRoute = createRouteMatcher(["/portal/login(.*)", "/portal/sign-up(.*)"]);

const clerkProxyUrl = process.env.CLERK_PROXY_URL || process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
const clerkAuthorizedParties = process.env.CLERK_AUTHORIZED_PARTIES
  ? process.env.CLERK_AUTHORIZED_PARTIES.split(",")
      .map((party) => party.trim())
      .filter(Boolean)
  : undefined;

const clerk = clerkMiddleware(
  async (auth, request: NextRequest) => {
    if (isProtectedPortalRoute(request) && !isPublicPortalRoute(request)) {
      await auth.protect();
    }

    return NextResponse.next();
  },
  {
    publishableKey:
      process.env.CLERK_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    proxyUrl: clerkProxyUrl,
    authorizedParties: clerkAuthorizedParties,
  },
);

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isAdminRoute(request)) {
    if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
      console.error("ADMIN_USER and ADMIN_PASS environment variables must be set");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const basicAuth = request.headers.get("authorization");
    const expectedAuth = "Basic " + Buffer.from(
      `${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}`,
    ).toString("base64");

    if (basicAuth !== expectedAuth) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area"',
        },
      });
    }

    return NextResponse.next();
  }

  return clerk(request, event);
}

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
