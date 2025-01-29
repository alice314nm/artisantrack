"use client";

import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import Link from "next/link";
import { useState } from "react";

export default function Page() {  
  const [user, setUser] = useState(true)

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Profile" userName={"Olga Ivanova"} />

        <form className="mt-20 flex flex-col gap-3 items-center">
            <div className="flex flex-col gap-3 pb-3">
                <label className="font-semibold w-96">Artisan:</label>
                <input
                type="text"
                className="border p-2 rounded"
                />
            </div>

            <div className="flex flex-col gap-3 pb-3">
                <label className="font-semibold w-96">Set tax (%):</label>
                <input
                type="text"
                className="border p-2 rounded"
                min="0"
                />
            </div>

            <button type="submit" className="w-44 bg-green font-bold px-4 py-2 rounded">
                Save
            </button>
        </form>
        
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
