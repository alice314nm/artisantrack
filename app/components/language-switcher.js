"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next-intl/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchToLocale = (nextLocale) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="flex items-center gap-2 px-2">
      <button
        onClick={() => switchToLocale("en")}
        className={`font-medium px-2 py-1 rounded ${
          locale === "en" ? "bg-green text-white" : "hover:bg-gray-100"
        }`}
        disabled={isPending || locale === "en"}
      >
        EN
      </button>
      <button
        onClick={() => switchToLocale("ru")}
        className={`font-medium px-2 py-1 rounded ${
          locale === "ru" ? "bg-green text-white" : "hover:bg-gray-100"
        }`}
        disabled={isPending || locale === "ru"}
      >
        RU
      </button>
    </div>
  );
}
