"use client";

import { getUserData } from "@/app/_services/user-data";
import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import Link from "next/link";
import NotLoggedWindow from "./components/not-logged-window";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const tileStyle =
    "border-b border-b-darkBeige px-4 pb-4 flex flex-col gap-4 items-start justify-between transition-all duration-300";
  const titleStyle = "text-lg font-bold";
  const infoStyle = "text text-blackBeige";
  const LinkStyle =
    "w-44 text-center bg-green px-4 font-semibold rounded-lg py-2 hover:bg-darkGreen transition-all duration-300";

  useEffect(() => {
    document.title = "Home - Artisan Track";
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

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
        />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-6">
        <Header title="Artisan Track" />

        <div className="flex flex-col gap-4 pb-20">
          <h1 className="text-xl font-bold px-4">
            Welcome back, {user.displayName}!
          </h1>

          {/* Main Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={tileStyle}>
              <p className={titleStyle}>Orders</p>
              <div className="space-y-2">
                <p className={infoStyle}>
                  In Progress:
                  {userData
                    ? Math.max(0, userData.inProgressOrders)
                    : "Loading..."}
                </p>
                <p className={infoStyle}>
                  Completed:
                  {userData
                    ? Math.max(0, userData.completedOrders)
                    : "Loading..."}
                </p>
              </div>
              <Link data-id="view-orders" className={LinkStyle} href="/orders">
                View Orders
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>Materials</p>
              <div className="space-y-2">
                <p className={infoStyle}>
                  Total Materials:
                  {userData
                    ? Math.max(0, userData.materialCount)
                    : "Loading..."}
                </p>
              </div>
              <Link
                data-id="view-materials"
                className={LinkStyle}
                href="/materials"
              >
                View Materials
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>Products</p>
              <div className="space-y-2">
                <p className={infoStyle}>
                  Total Products:
                  {userData ? Math.max(0, userData.productCount) : "Loading..."}
                </p>
              </div>
              <Link
                data-id="view-products"
                className={LinkStyle}
                href="/products"
              >
                View Products
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>Finance</p>
              <div className="space-y-2">
                <p className={infoStyle}>
                  Revenue: ${userData?.monthlyIncome ?? "Loading..."}
                </p>
                <p className={infoStyle}>
                  Expenses: ${userData?.monthlyExpenses ?? "Loading..."}
                </p>
              </div>
              <Link
                data-id="view-finances"
                className={LinkStyle}
                href="/finances"
              >
                View Finances
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
        <Header title="Artisan Track" />
        <NotLoggedWindow />
      </div>
    );
  }
}
