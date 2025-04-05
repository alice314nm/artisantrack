"use client";

import { useTranslations } from "next-intl";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import Header from "@/app/[locale]/components/header";
import SignInOutWindow from "@/app/[locale]/components/sign-in-out-window";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import Menu from "@/app/[locale]/components/menu";

export default function SignInPage() {
  const t = useTranslations("signup");
  const { user, doCreateUserWithEmailAndPassword } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tax, setTax] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputStyle =
    "w-80 border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500";

  useEffect(() => {
    document.title = t("title");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !name || !password || !repeatPassword) {
      setError(t("errors.requiredFields"));
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError(t("errors.invalidEmail"));
      return;
    }

    if (password !== repeatPassword) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("errors.passwordLength"));
      return;
    }

    let formattedTax = tax.trim();
    if (formattedTax && !formattedTax.endsWith("%")) {
      formattedTax = `${formattedTax}%`;
    }

    setIsLoading(true);

    try {
      await doCreateUserWithEmailAndPassword(
        email,
        password,
        name,
        formattedTax
      );
      setSuccess(true);
      window.location.href = "/";
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
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
      <Header title="Artisan Track" />
      {user ? (
        <div>
          <SignInOutWindow type="SignOut" />
          <Menu type="OnlySlideMenu" />
        </div>
      ) : (
        <form
          onSubmit={handleSignUp}
          className="mt-10 flex flex-col gap-4 p-6 items-center justify-center"
        >
          <h2 className="text-xl font-bold">{t("title")}</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{t("success")}</p>}

          {/* Email */}
          <div className="flex flex-col w-80">
            <label>
              {t("email")} <span className="text-red">*</span>
            </label>
            <input
              data-id="email"
              type="text"
              placeholder={t("placeholders.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          {/* Name */}
          <div className="flex flex-col w-80">
            <label>
              {t("name")} <span className="text-red">*</span>
            </label>
            <input
              data-id="name"
              type="text"
              placeholder={t("placeholders.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          {/* Tax */}
          <div className="flex flex-col w-80">
            <label>{t("tax")}</label>
            <input
              data-id="tax"
              type="text"
              placeholder={t("placeholders.tax")}
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col w-80">
            <label>
              {t("password")} <span className="text-red">*</span>
            </label>
            <input
              data-id="password"
              type="password"
              placeholder={t("placeholders.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          {/* Repeat Password */}
          <div className="flex flex-col w-80">
            <label>
              {t("repeatPassword")} <span className="text-red">*</span>
            </label>
            <input
              data-id="repeat-password"
              type="password"
              placeholder={t("placeholders.repeatPassword")}
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <button
            data-id="sign-up"
            type="submit"
            className={`bg-green p-2 rounded-xl w-80 font-bold ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? t("signingUp") : t("signUp")}
          </button>

          <Link href="/login">
            <p className="text-sm text-center">
              {t("alreadyHaveAccount")}{" "}
              <span className="underline cursor-pointer text-sky-500">
                {t("login")}
              </span>
            </p>
          </Link>
        </form>
      )}
    </main>
  );
}
