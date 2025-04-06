// middleware.js
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware({
  ...routing,
  localeDetection: true, // Important: tries to detect the locale
  // Prefer locale in cookie if present
  getLocale: ({ request }) => {
    const locale = request.cookies.get('NEXT_LOCALE')?.value;
    return locale;
  }
});

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
