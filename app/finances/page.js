"use client";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "../_utils/firebase";
import { getUserData } from "@/app/_services/user-data";
import { useUserAuth } from "@/app/_utils/auth-context";
import BlockHolder from "@/app/components/block-holder";
import DocumentHolder from "@/app/components/document-holder";
import FilterWindow from "@/app/components/filter-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SearchBar from "@/app/components/search-bar";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [newTax, setNewTax] = useState("");
  const [isTaxChanging, setIsTaxChanging] = useState(false);

  const buttonStyle = "bg-green px-2 py-1 rounded-lg w-60 text-center";

  useEffect(() => {
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
        <Header title="Finance" showUserName={true} />

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <div className="flex flex-row justify-between">
            <p>All orders:</p>
            <div>
              Set Tax:{" "}
              {isTaxChanging ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newTax}
                    onChange={handleTaxChange}
                    className="w-20"
                  />
                  <button
                    onClick={saveTax}
                    className="bg-green px-2 py-1 rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelTaxChange}
                    className="bg-red px-2 py-1 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <span>
                  {userData ? `${userData.tax ?? "N/A"}` : "Loading..."}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-between items-start">
            <div>
              <p>In progress: {userData?.inProgressOrders ?? "Loading..."}</p>
              <p>Completed: {userData?.completedOrders ?? "Loading..."}</p>
            </div>
            {!isTaxChanging && (
              <button
                className="bg-green px-2 py-1 rounded-lg"
                onClick={() => setIsTaxChanging(true)}
              >
                Change Tax
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>
            This month (
            {new Date().toLocaleString("default", { month: "long" })}):
          </p>
          <p>
            Income: {userData?.monthlyIncome ?? "Loading..."}$ Expenses:{" "}
            {userData?.monthlyExpenses ?? "Loading..."}$
          </p>
          <Link href="finances/monthly" className={buttonStyle}>
            Monthly Financial Report
          </Link>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>This year ({new Date().getFullYear()}):</p>
          <p>
            Income: {userData?.yearlyIncome ?? "Loading..."}$ Expenses:{" "}
            {userData?.yearlyExpenses ?? "Loading..."}$
          </p>
          <Link href="finances/yearly" className={buttonStyle}>
            Yearly Financial Report
          </Link>{" "}
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>Other reports:</p>
          <div className="flex flex-col gap-2 w-60">
            <button className={buttonStyle}>Labor Cost</button>
            <button className={buttonStyle}>Supply Expenses</button>
            <button className={buttonStyle}>Order Payments</button>
          </div>
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
