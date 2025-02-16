"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import Link from "next/link";
import { useState } from "react";

export default function WelcomePage() {
  const { user } = useUserAuth();

  const dashboardStyle = "text-lg border border=darkBeige flex flex-row gap-2 items-center p-5"
  const LinkStyle = "bg-green px-2 font-bold rounded-lg py-1"

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="" showUserName={true} />

        <div className="flex flex-col gap-2 p-5">
          <h1 className="text-xl font-bold">Welcome, {user.displayName}!</h1>

          <div className={dashboardStyle}>
            <p>Orders </p>
            <p>In progress: 123</p>
            <p>Completed: 123</p>
            <Link className={LinkStyle} href='/pages/orders'>View</Link>
          </div>

          <div className={dashboardStyle}>
            <div className="flex flex-col gap-2">
              <p >Inventory</p>
              <div className="flex flex-col w-full justify-between">
                <p>Products: 123</p>
                <p>Materials: 123</p>
              </div>              
            </div>            
            <Link className={LinkStyle} href='/pages/orders'>View</Link>
          </div>

          <div className={dashboardStyle}>

          </div>

          <div className={dashboardStyle}>

          </div>
        </div>
        
        <Menu
          type="OnlySlideMenu"
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Artisan Track" />

        <div className="fixed w-screen h-screen flex flex-col text-center items-centeer justify-center gap-4">
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
      </div>
    );
  }
}
