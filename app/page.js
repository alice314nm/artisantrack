"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import Link from "next/link";
import NotLoggedWindow from "./components/not-logged-window";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);

  const tileStyle =
    "border-b border-b-darkBeige px-4 pb-4 rounded-xl flex flex-col gap-4 items-start justify-between transition-all duration-300";
  const titleStyle = "text-lg font-bold";
  const infoStyle = "text text-blackBeige";
  const LinkStyle =
    "w-44 text-center bg-green px-4 font-semibold rounded-lg py-2 hover:bg-darkGreen transition-all duration-300";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

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
                <p className={infoStyle}>In Progress: 123</p>
                <p className={infoStyle}>Completed: 456</p>
              </div>
              <Link className={LinkStyle} href="/orders">
                View Orders
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>Materials</p>
              <div className="space-y-2">
                <p className={infoStyle}>Total Materials: 123</p>
              </div>
              <Link className={LinkStyle} href="/materials">
                View Materials
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>Products</p>
              <div className="space-y-2">
                <p className={infoStyle}>Total Products: 45</p>
              </div>
              <Link className={LinkStyle} href="/products">
                View Products
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>Finance</p>
              <div className="space-y-2">
                <p className={infoStyle}>Revenue: $1,234</p>
                <p className={infoStyle}>Expenses: $567</p>
              </div>
              <Link className={LinkStyle} href="/finances">
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
