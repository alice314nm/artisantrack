// middleware.js
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const middleware = createMiddleware(routing);

export default function (request) {
  const response = middleware(request);

  // Add cache control headers
  if (response) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  return response;
}

export const config = {
  // Skip all paths that should not be internationalized.
  // This skips the root route and all API routes
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
