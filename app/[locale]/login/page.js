"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import SignInOutWindow from "@/app/components/sign-in-out-window";
import Link from "next/link";
import { useEffect, useState } from "react";
import Menu from "../../components/menu";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const { user, doSignInUserWithEmailAndPassword, resetPassword } =
    useUserAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const t = useTranslations("loginPage");

  useEffect(() => {
    document.title = t("pageTitle");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [t]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await doSignInUserWithEmailAndPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError(t("errorNoAccount"));
      } else if (err.code === "auth/invalid-credential") {
        setError(t("errorInvalidPassword"));
      } else if (err.code === "auth/missing-password") {
        setError(t("errorMissingPassword"));
      } else if (err.code === "auth/invalid-email") {
        setError(t("errorInvalidEmail"));
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setMessage(t("resetPasswordMessage"));
      setError("");
      setResetPasswordMode(false);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img src="/loading-gif.gif" className="h-10" />
      </div>
    );
  }

  return (
    <main>
      {showSuccess && (
        <div className="fixed top-0 left-0 w-full font-semibold text-2xl bg-green px-5 py-4 text-center animate-pulse z-50">
          <p>{t("successMessage")}</p>
        </div>
      )}
      <Header title="Artisan Track" />
      {user ? (
        <div>
          <SignInOutWindow type={"SignOut"} />
          <Menu type="OnlySlideMenu" />
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center">
          {resetPasswordMode ? (
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-3 items-center"
            >
              <h2 className="text-2xl font-bold">{t("resetPasswordTitle")}</h2>
              {error && <p className="text-red-500">{error}</p>}
              {message && <p className="text-green-500">{message}</p>}
              <input
                type="email"
                placeholder={t("enterEmail")}
                className="border rounded-lg p-2 w-80 focus:ring-sky-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="bg-green px-6 py-2 rounded-lg font-bold"
              >
                {t("sendResetLink")}
              </button>
              <p
                className="text-sky-500 underline cursor-pointer"
                onClick={() => setResetPasswordMode(false)}
              >
                {t("backToLogin")}
              </p>
            </form>
          ) : (
            <form
              onSubmit={handleSignIn}
              className="flex flex-col gap-3 items-center"
            >
              <h2 className="text-2xl font-bold">{t("loginTitle")}</h2>
              {error && <p className="text-red-500">{error}</p>}
              <input
                data-id="email"
                type="email"
                placeholder={t("enterEmail")}
                className="border rounded-lg p-2 w-80 focus:ring-sky-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                data-id="password"
                type="password"
                placeholder={t("enterPassword")}
                className="border rounded-lg p-2 w-80 focus:ring-sky-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className={`bg-green p-2 rounded-xl w-80 font-bold ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-600"
                }`}
                disabled={isLoading}
              >
                {isLoading ? `${t("loginTitle")}...` : t("loginTitle")}
              </button>
              <p
                className="text-sky-500 underline cursor-pointer"
                onClick={() => setResetPasswordMode(true)}
              >
                {t("forgotPassword")}
              </p>
              <p>
                {t("signUpPrompt")}{" "}
                <Link href="/signin">
                  <span className="text-sky-500 underline cursor-pointer">
                    {t("signUpLink")}
                  </span>
                </Link>
              </p>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
