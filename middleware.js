// middleware.js
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware({
  // Add additional configuration
  ...routing,
  // Set a cookie duration for persistent language selection
  localeDetection: true,
  localePrefix: "always", // Force locale prefix in URL
  defaultLocale: routing.defaultLocale,
  locales: routing.locales,
  // Use a cookie to store the locale
  // This can help with persistence issues
  localePrefix: "always",
});

export const config = {
  // Skip all paths that should not be internationalized.
  // This skips the root route and all API routes
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};