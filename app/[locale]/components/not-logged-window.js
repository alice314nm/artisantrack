import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotLoggedWindow() {
  const t = useTranslations("notLogged");

  return (
    <div className="inset-0 flex items-center justify-center bottom-44">
      <div className="w-96 p-6 flex flex-col text-left items-center gap-4">
        <p className="text-lg text-left">
          {t("welcome")} <span className="font-bold">Artisan Track!</span>
          {t("description")}
        </p>
        <p className="text-left text-gray-600">{t("prompt")}</p>

        <div className="flex flex-col gap-3 w-full">
          <Link href="/login">
            <button className="font-bold bg-green py-2 px-4 rounded-lg w-full">
              {t("login")}
            </button>
          </Link>
          <Link href="/signin">
            <button className="font-bold border-2 border-green py-2 px-4 rounded-lg w-full">
              {t("createAccount")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
