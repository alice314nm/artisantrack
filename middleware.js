// middleware.js
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware({
  ...routing,
  localeDetection: true,
  localePrefix: "always",
  defaultLocale: routing.defaultLocale,
  locales: routing.locales,
  localePrefix: "always",
});

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};