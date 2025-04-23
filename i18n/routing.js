// i18n/routing.js
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru", "fil", "zh", "hi"],
  defaultLocale: "en",
});
