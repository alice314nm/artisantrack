import Link from "next/link";
import { useTranslations } from "next-intl";
import React from "react";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";

export default function SignInOutWindow({ type, text }) {
  const t = useTranslations("SignInOutWindow");
  const { firebaseSignOut } = useUserAuth();

  if (type === "SignOut") {
    return (
      <div className="flex items-center justify-center mt-20">
        <div className="bg-beige w-80 rounded-lg p-5 text-center">
          <p>{t("alreadySignedIn")}</p>
          <p>{t("wantToSignOut")}</p>
          <a onClick={firebaseSignOut} className="text-sky-500 underline">
            {t("signOut")}
          </a>
        </div>
      </div>
    );
  } else if (type === "SignIn") {
    return (
      <div className="flex items-center justify-center mt-20">
        <div className="bg-beige w-80 rounded-lg p-5 text-center">
          <p>{t("pleaseSignIn", { text })}</p>
          <Link href="./signin" className="text-sky-500 underline">
            {t("goToSignIn")}
          </Link>
        </div>
      </div>
    );
  }
}
