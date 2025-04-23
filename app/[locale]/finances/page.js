"use client";

import { useTranslations } from "use-intl";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useLocale } from "next-intl";
import { app } from "@/app/[locale]/_utils/firebase";
import { getUserData } from "@/app/[locale]/_services/user-data";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import BlockHolder from "@/app/[locale]/components/block-holder";
import DocumentHolder from "@/app/[locale]/components/document-holder";
import FilterWindow from "@/app/[locale]/components/filter-window";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import SearchBar from "@/app/[locale]/components/search-bar";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const t = useTranslations("Finance");
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [newTax, setNewTax] = useState("");
  const [isTaxChanging, setIsTaxChanging] = useState(false);
  const buttonStyle =
    "bg-green px-2 py-1 rounded-lg w-60 text-center hover:bg-darkGreen";
  const locale = useLocale();
  const currentMonth = new Date().toLocaleString(locale, { month: "long" });

  useEffect(() => {
    document.title = t("pageTitle");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserData(user, setUserData).finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (userData && userData.tax) {
      setNewTax(userData?.tax ? `${userData.tax}%` : "");
    }
  }, [userData]);

  const handleTaxChange = (e) => {
    const value = e.target.value;
    setNewTax(value);
  };

  const saveTax = async () => {
    if (!user || newTax === "") return;

    try {
      setLoading(true);
      const db = getFirestore(app);
      const userDoc = doc(db, `users/${user.uid}`);
      await updateDoc(userDoc, { tax: `${newTax}%` });
      setUserData((prevData) => ({
        ...prevData,
        tax: `${newTax}%`,
      }));
      setIsTaxChanging(false);
      console.log("Tax updated successfully");
    } catch (error) {
      console.error("Error updating tax:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelTaxChange = () => {
    setNewTax(userData?.tax ? `${userData.tax}%` : "");
    setIsTaxChanging(false);
  };

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img
          src="/loading-gif.gif"
          className="h-10"
          data-id="loading-spinner"
        />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("pageTitle")} showUserName={true} />

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <div className="flex flex-row justify-between">
            <p>{t("allOrders")}</p>
            <div className="h-10 flex items-center">
              {t("setTax")}:
              {isTaxChanging ? (
                <div className="flex gap-2 items-center ">
                  <input
                    type="number"
                    value={newTax}
                    onChange={handleTaxChange}
                    className="ml-2 w-20 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green p-2"
                  />
                  <span>%</span>
                  <button
                    onClick={saveTax}
                    className="bg-green py-2 px-4 rounded-lg hover:bg-darkGreen"
                  >
                    {t("buttons.save")}
                  </button>
                  <button
                    onClick={cancelTaxChange}
                    className="bg-red py-2 px-4 rounded-lg hover:bg-rose-800"
                  >
                    {t("buttons.cancel")}
                  </button>
                </div>
              ) : (
                <span>
                  {userData ? `${userData.tax ?? "N/A"}` : t("loading")}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-between items-start">
            <div>
              <p>
                {t("inProgress")}: {userData?.inProgressOrders ?? t("loading")}
              </p>
              <p>
                {t("completed")}: {userData?.completedOrders ?? t("loading")}
              </p>
            </div>
            {!isTaxChanging && (
              <button
                className="bg-green px-2 py-1 rounded-lg hover:bg-darkGreen"
                onClick={() => setIsTaxChanging(true)}
              >
                {t("buttons.changeTax")}
              </button>
            )}
          </div>
        </div>

        {/* Monthly Section */}
        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>{t("thisMonth", { month: currentMonth })}</p>
          <p>
            {t("income")}:{" "}
            {userData?.monthlyIncome
              ? userData.monthlyIncome.toFixed(2)
              : t("loading")}
            $
          </p>
          <p>
            {t("expenses")}:{" "}
            {userData?.monthlyExpenses
              ? userData.monthlyExpenses.toFixed(2)
              : t("loading")}
            $
          </p>
          <Link href="finances/monthly" className={buttonStyle}>
            {t("monthlyReport")}
          </Link>
        </div>

        {/* Yearly Section */}
        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>{t("thisYear", { year: new Date().getFullYear() })}</p>
          <p>
            {t("income")}:{" "}
            {userData?.yearlyIncome
              ? userData.yearlyIncome.toFixed(2)
              : t("loading")}
            $
          </p>
          <p>
            {t("expenses")}:{" "}
            {userData?.yearlyExpenses
              ? userData.yearlyExpenses.toFixed(2)
              : t("loading")}
            $
          </p>
          <Link href="finances/yearly" className={buttonStyle}>
            {t("yearlyReport")}
          </Link>
        </div>

        <FilterWindow
          onClose={closeConfirmation}
          windowVisibility={confirmWindowVisibility}
        />

        <Menu type="OnlySlideMenu" iconFirst="/link.png" />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Artisan Track" />
        <NotLoggedWindow />
      </div>
    );
  }
}
