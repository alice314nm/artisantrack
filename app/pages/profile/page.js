"use client";

import BlockHolder from "@/app/components/block-holder";
import DocumentHolder from "@/app/components/document-holder";
import FilterWindow from "@/app/components/filter-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import SearchBar from "@/app/components/search-bar";
import Link from "next/link";
import { useState } from "react";

export default function Page() {  
  const [user, setUser] = useState(true)

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Profile" userName={"Olga Ivanova"} />

        <div className="flex flex-row justify-between gap-2 border-b border-b-darkBeige px-5 pb-3">
        <p className="underline">Artisan: <br></br>Olga Ivanova</p>
          <button className="flex flex-row h-8 bg-green w-20 gap-2 item-center justify-center py-1 rounded-lg">
            <p>Edit</p>
            <img src="/Pencil.png" className="w-5"/>
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
            <p className="underline">Current email:</p>
            <p>email@example.com</p>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
            <p className="underline">Inventory:</p>
            <p>Total products: 123</p>
            <p>Total materials: 40</p>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
            <p className="underline">Orders:</p>
            <p>In progress: 4</p>
            <p>Completed: 30</p>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
            <p className="underline">Set tax:</p>
            <p>4%</p>
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
