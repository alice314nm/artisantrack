// middleware.js
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default function middleware(req) {
  const preferredLanguage = req.cookies.get("preferredLanguage")?.value;

  if (
    preferredLanguage &&
    !req.nextUrl.pathname.startsWith(`/${preferredLanguage}`)
  ) {
    const url = req.nextUrl.clone();
    url.pathname = `/${preferredLanguage}${req.nextUrl.pathname}`;
    return NextResponse.redirect(url);
  }

  return createMiddleware(routing)(req);
}

export const config = {
  // Skip all paths that should not be internationalized.
  // This skips the root route and all API routes
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
