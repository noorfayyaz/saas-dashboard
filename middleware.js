// This runs BEFORE every matching request, on Next.js's lightweight "Edge"
// runtime. We keep it simple here (just check the cookie exists) - the
// real, full verification of the token happens again inside each page/API
// route via lib/auth.js. Two layers of defense.

import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
