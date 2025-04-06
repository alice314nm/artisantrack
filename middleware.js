// middleware.js
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

// Create a single middleware function that handles all logic
export default function middleware(request) {
  const acceptLanguage = request.headers.get("accept-language");
  const preferredLocale = acceptLanguage?.split(",")[0]?.split(";")[0] || "en"; // Default to 'en' if no language is specified
  const { pathname } = request.nextUrl;

  // Redirect to the preferred locale if the user is on the root path
  if (pathname === "/") {
    const redirectUrl = new URL(`/${preferredLocale}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle all other internationalized routes
  return createMiddleware(routing)(request);
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
