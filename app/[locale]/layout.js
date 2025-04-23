import { NextIntlClientProvider } from "next-intl";
import ClientLayout from "./clientlayout";
import "../globals.css";

export const metadata = {
  title: "Artisan Track",
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import(`../../messages/en.json`)).default;
  }

  return (
    <html lang={locale}>
      <head></head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
