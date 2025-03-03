"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import BlockHolder from "@/app/components/block-holder";
import FilterWindow from "@/app/components/filter-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SearchBar from "@/app/components/search-bar";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ Categories: [], "Sort by": "" });
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const timeout = setTimeout(() => {
      setLoading(false);
      }, 300); 

      return () => clearTimeout(timeout);
  }, []);

  const handleNavigateToCreatePage = () => {
    window.location.href = "/create_order";
  };

  const toggleConfirmation = () => {
    setConfirmWindowVisibility((prev) => !prev);
  };

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
  };

  const handleApplyFilters = (selectedFilters) => {
    setFilters(selectedFilters);
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
        <Header title="Orders" showUserName={true} />

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
          <Link href='/orderid' key={123}>
            <BlockHolder
              key={123}
              id={123}
              title={"testTitle"}
              category={"testCategory"}
              total={123}
              imageSource={"/noImage.png"}
              type={"order"}
            />
          </Link>

        </div>

        <FilterWindow
          onClose={closeConfirmation}
          windowVisibility={confirmWindowVisibility}
          onApplyFilters={handleApplyFilters}
          // categories={categories}
          pageType={"order"}
        />

        <Menu
          type="OneButtonMenu"
          iconFirst="/link.png"
          firstTitle="Create order +"
          onFirstFunction={handleNavigateToCreatePage}
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
