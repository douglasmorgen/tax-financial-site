import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
    console.error('ADMIN_USER and ADMIN_PASS environment variables must be set');
    return new NextResponse("Server configuration error", { status: 500 });
  }

  const basicAuth = request.headers.get("authorization");

  const expectedAuth = "Basic " + Buffer.from(
    `${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}`
  ).toString("base64");

  if (basicAuth === expectedAuth) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};
