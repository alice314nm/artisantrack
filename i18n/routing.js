// i18n/routing.js
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru"],
  defaultLocale: "en",
  // Add explicit cookie configuration
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // Only secure in production
  },
});
