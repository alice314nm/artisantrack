"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import BlockHolder from "@/app/components/block-holder";
import FilterWindow from "@/app/components/filter-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import SearchBar from "@/app/components/search-bar";
import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUserAuth();

  const handleNavigateToCreatePage = () => {
    window.location.href = "/pages/create_material";
  };

  const toggleConfirmation = () => {
    setConfirmWindowVisibility((prev) => !prev);
  };

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
  };

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Materials" showUserName={true} />

        <div className="flex flex-row justify-between mx-4">
          <p className="font-bold">Total: 30</p>

          <div className="bg-green rounded-xl px-4 font-bold cursor-pointer">
            Create document
          </div>
        </div>

        <SearchBar
          onOpenFilters={toggleConfirmation}
          onSearch={(term) => setSearchTerm(term)}
          filterOn={true}
        />

        <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
          <Link href="/pages/materialid" key={123} data-id="material-block">
            <BlockHolder
              key={123}
              id={123}
              title={"testTitle"}
              category={"testCategory"}
              total={123}
              color={"black"}
              imageSource={"/wool.png"}
              type={"material"}
            />
          </Link>
        </div>

        <FilterWindow
          onClose={closeConfirmation}
          windowVisibility={confirmWindowVisibility}
        />

        <Menu
          type="TwoButtonsMenu"
          iconFirst="/link.png"
          firstTitle="Copy for client"
          secondTitle="Create material +"
          onSecondFunction={handleNavigateToCreatePage}
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