"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import { updateUserLanguage } from "@/app/[locale]/_services/user-data";

export default function LanguageSelector() {
  const { user } = useUserAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
  ];

  const handleLanguageChange = async (locale) => {
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "");
    const newPath = `/${locale}${pathWithoutLocale || ""}`;
  
    // Save to DB if user is logged in
    if (user) {
      await updateUserLanguage(user, locale);
    }
  
    // Save preferred locale to cookie
    document.cookie = `NEXT_LOCALE=${locale}; path=/`;
  
    // Navigate to the new locale path
    router.push(newPath);
    setIsOpen(false);
  };
  
  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 rounded hover:bg-darkBeige"
      >
        <span>{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.name}</span>
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-beige rounded-md shadow-lg z-10">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`block w-full text-left px-4 py-2 hover:bg-darkBeige ${currentLocale === language.code
                ? "font-semibold bg-darkBeige/30"
                : ""
                }`}
            >
              <span className="mr-2">{language.flag}</span>
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
