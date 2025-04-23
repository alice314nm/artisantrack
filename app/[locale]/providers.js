"use client";

import { NextIntlClientProvider } from "next-intl";
import { AuthContextProvider } from "@/app/[locale]/_utils/auth-context";

export function Providers({ children, locale, messages }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </NextIntlClientProvider>
  );
}
