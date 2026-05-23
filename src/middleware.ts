import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isProtectedPortalRoute = createRouteMatcher(["/portal(.*)", "/api/client(.*)"]);
const isPublicPortalRoute = createRouteMatcher(["/portal/login(.*)", "/portal/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  if (process.env.DEBUG_PROXY_HEADERS === "true") {
    console.log("[proxy-debug]", JSON.stringify({
      path: request.nextUrl.pathname,
      host: request.headers.get("host"),
      origin: request.headers.get("origin"),
      xForwardedHost: request.headers.get("x-forwarded-host"),
      xForwardedProto: request.headers.get("x-forwarded-proto"),
      xForwardedPort: request.headers.get("x-forwarded-port"),
      xForwardedFor: request.headers.get("x-forwarded-for"),
      xRealIp: request.headers.get("x-real-ip"),
    }));
  }

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
  }

  if (isProtectedPortalRoute(request) && !isPublicPortalRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
