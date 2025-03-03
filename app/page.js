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

  const dashboardStyle = "text-lg border-b border-darkBeige flex flex-col gap-2 items-start justify-between px-5 pb-5"
  const LinkStyle = "bg-green px-2 font-bold rounded-lg py-1"

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
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Artisan Track"/>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold p-5">Welcome back, {user.displayName}!</h1>

          <div className={dashboardStyle}>
            <p>Orders </p>
            <div>
              <p>In progress: 123</p>
              <p>Completed: 123</p>
            </div>            
            <Link className={LinkStyle} href='/orders'>View</Link>
          </div>

          <div className={dashboardStyle}>
            <div className="flex flex-col gap-2">
              <p >Inventory</p>
              <div className="flex flex-row w-full justify-between">
                <p>Products: 123</p>
                <p>Materials: 123</p>
              </div>              
            </div>            
            <div>
              <Link className={LinkStyle} href='/materials'>View</Link>
              <Link className={LinkStyle} href='/products'>View</Link>
            </div> 
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
        <NotLoggedWindow />
      </div>
    );
  }
}
