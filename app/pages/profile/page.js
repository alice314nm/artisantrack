"use client";

import { getUserData } from "@/app/_services/user-data";
import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {  
  const { user } = useUserAuth();
  const [userData, setUserData] = useState(null); 


  useEffect(() => {
    if (user) {
      getUserData(user, setUserData);
    }
  }, [user]);


  const sectionStyle = "flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4";
  const contentStyle = "";

  return (
    <div className="flex flex-col min-h-screen gap-4 bg-lightBeige">
      <Header title="Profile" />
      {user ? (
        <div className="flex flex-col gap-4">
          {/* Profile Header */}
          <div className="flex flex-row justify-between items-center gap-4 border-b border-b-darkBeige px-5 pb-4">
            <p className="text-xl font-semibold">Artisan: {user.displayName}</p>
            <Link href="/pages/profile_settings" className="flex items-center gap-2 bg-green py-2 px-4 rounded-md hover:bg-green-600 transition-all duration-200">
              <p className="font-semibold">Edit</p>
              <img src="/Pencil.png" className="w-5" />
            </Link>
          </div>

          {/* Email Section */}
          <div className={sectionStyle}>
            <p>Current email:</p>
            <p className={contentStyle}>{user.email || "email@example.com"}</p>
          </div>

          {/* Inventory Section */}
          <div className={sectionStyle}>
            <p>Inventory:</p>
            <p className={contentStyle}>Total products: {userData ? Math.max(0, userData.productCount - 1) : "Loading..."}</p>
            <p className={contentStyle}>Total materials: {userData ? Math.max(0, userData.materialCount - 1) : "Loading..."}</p>
            </div>

          {/* Orders Section */}
          <div className={sectionStyle}>
            <p>Orders:</p>
            <p className={contentStyle}>In progress: {userData ? Math.max(0, userData.orderCount - 1) : "Loading..."}</p>
            <p className={contentStyle}>Completed: 0</p>  {/* Example static data, adjust as needed */}
          </div>

          {/* Tax Section */}
          <div className={sectionStyle}>
            <p>Set tax: {userData?.tax || "Tax not set"}</p>
          </div>
          <Menu type="OnlySlideMenu" />
        </div>
      ) : (
        <div className="fixed w-screen h-screen flex flex-col text-center items-center justify-center gap-4">
          <p>
            Create account to start your <br />
            artisan track
          </p>
          <Link href="/pages/signin">
            <button className="font-bold bg-green py-2 px-4 rounded-lg">
              Sign in
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
