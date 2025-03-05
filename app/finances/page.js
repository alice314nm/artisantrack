"use client";

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


  const buttonStyle = "bg-green px-2 py-1 rounded-lg w-60 text-center"


  useEffect(() => {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1000);
  
      return () => clearTimeout(timeout);
    }, []);


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
            <p>Set Tax: 123%</p>
          </div>
          
          <div className="flex flex-row justify-between items-start">
            <div>
            <p>In progress: 4</p>
            <p>Completed: 30</p>
            </div>
            <button className="bg-green px-2 py-1 rounded-lg">Change Tax</button>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>This month (january):</p>
          <p>Income: 1234$ Expenses: 123$</p>
          <Link href="finances/monthly" className={buttonStyle}>Monthly Financial Report</Link>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>This year (2025):</p>
          <p>Income: 1234$ Expenses: 123$</p>
          <Link href="finances/yearly" className={buttonStyle}>Yearly Financial Report</Link>        </div>

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

        <Menu
          type="OnlySlideMenu"
          iconFirst="/link.png"
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Artisan Track" />
        <NotLoggedWindow/>        
      </div>
    );
  }
}
