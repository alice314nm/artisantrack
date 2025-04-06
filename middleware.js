// middleware.js
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip all paths that should not be internationalized.
  // This skips the root route and all API routes
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
