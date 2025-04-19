"use client";

import { getUserData } from "@/app/[locale]/_services/user-data";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import Link from "next/link";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function WelcomePage() {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const t = useTranslations("WelcomePage");

  const tileStyle =
    "border-b border-b-darkBeige px-4 pb-4 flex flex-col gap-4 items-start justify-between transition-all duration-300";
  const tileStyle2 =
    "border-b border-b-darkBeige px-4 pb-4 flex flex-col gap-4 items-start justify-start transition-all duration-300";

  const titleStyle = "text-lg font-bold";
  const infoStyle = "text text-blackBeige";
  const LinkStyle =
    "w-full text-center bg-green px-4 font-semibold rounded-lg py-2 hover:bg-darkGreen transition-all duration-300";

  useEffect(() => {
    document.title = t("pageTitle");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [t]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserData(user, setUserData).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img
          src="/loading-gif.gif"
          className="h-10"
          data-id="loading-spinner"
          alt={t("loadingAlt")}
        />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-6">
        <Header title={t("headerTitle")} />

        <div className="flex flex-col gap-4 pb-20">
          <h1 className="text-xl font-bold px-4">
            {t("welcomeBack", { name: user.displayName })}
          </h1>

          {/* Main Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={tileStyle}>
              <p className={titleStyle}>{t("orders.title")}</p>
              <div className="space-y-2">
                <p className={infoStyle}>
                  {t("orders.inProgress")}:
                  {userData
                    ? Math.max(0, userData.inProgressOrders)
                    : t("loading")}
                </p>
                <p className={infoStyle}>
                  {t("orders.completed")}:
                  {userData
                    ? Math.max(0, userData.completedOrders)
                    : t("loading")}
                </p>
              </div>
              <Link data-id="view-orders" className={LinkStyle} href="/orders">
                {t("orders.viewButton")}
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>{t("materials.title")}</p>
              <div className="space-y-2">
                <p className={infoStyle}>
                  {t("materials.total")}:
                  {userData
                    ? Math.max(0, userData.materialCount)
                    : t("loading")}
                </p>
              </div>
              <Link
                data-id="view-materials"
                className={LinkStyle}
                href="/materials"
              >
                {t("materials.viewButton")}
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>{t("products.title")}</p>
              <div className="space-y-2">
                <p className={infoStyle}>
                  {t("products.total")}:
                  {userData ? Math.max(0, userData.productCount) : t("loading")}
                </p>
              </div>
              <Link
                data-id="view-products"
                className={LinkStyle}
                href="/products"
              >
                {t("products.viewButton")}
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>{t("finance.title")}</p>
              <div className="space-y-2">
                <p className={infoStyle}>
                  {t("finance.revenue")}: $
                  {userData?.monthlyIncome ?? t("loading")}
                </p>
                <p className={infoStyle}>
                  {t("finance.expenses")}: $
                  {userData?.monthlyExpenses ?? t("loading")}
                </p>
              </div>
              <Link
                data-id="view-finances"
                className={LinkStyle}
                href="/finances"
              >
                {t("finance.viewButton")}
              </Link>
            </div>
          </div>
        </div>

        <Menu type="OnlySlideMenu" />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-6">
        <Header title={t("headerTitle")} />
        <NotLoggedWindow />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={tileStyle2}>
            <p className={`flex flex-row items-center gap-2 ${titleStyle}`}>
              <img
                className="w-5"
                src="/inventory.png"
                alt={t("inventory.imageAlt")}
              />
              {t("inventory.title")}
            </p>
            <p className={infoStyle}>{t("inventory.description1")}</p>
            <p className={infoStyle}>{t("inventory.description2")}</p>
          </div>

          <div className={tileStyle2}>
            <p className={`flex flex-row items-center gap-2 ${titleStyle}`}>
              <img
                className="w-5"
                src="/orders.png"
                alt={t("trackOrders.imageAlt")}
              />
              {t("trackOrders.title")}
            </p>
            <p className={infoStyle}>{t("trackOrders.description1")}</p>
            <p className={infoStyle}>{t("trackOrders.description2")}</p>
          </div>

          <div className={tileStyle2}>
            <p className={`flex flex-row items-center gap-2 ${titleStyle}`}>
              <img
                className="w-5"
                src="/finances.png"
                alt={t("trackFinances.imageAlt")}
              />
              {t("trackFinances.title")}
            </p>
            <p className={infoStyle}>{t("trackFinances.description1")}</p>
            <p className={infoStyle}>{t("trackFinances.description2")}</p>
          </div>
        </div>
      </div>
    );
  }
}
