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
import { useState } from "react";

export default function Page() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUserAuth();

  const handleNavigateToCreatePage = () => {
    window.location.href = "/create_document";
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
        <Header title="Documents" showUserName={true} />

        <div className="flex flex-row justify-between mx-4">
          <p className="font-bold">Total: 30</p>
        </div>

        <SearchBar
          onOpenFilters={toggleConfirmation}
          onSearch={(term) => setSearchTerm(term)}
        />

        <div className="items-center mx-4 grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
          <Link href="/" key={123} data-id="document-block">
            <DocumentHolder
              key={123}
              id={123}
              title={"testTitle"}
              category={"testCategory"}
              total={123}
              type={"material"}
            />
          </Link>
        </div>

        <Menu
          type="OneButtonMenu"
          iconFirst="/link.png"
          firstTitle="Create document +"
          onFirstFunction={handleNavigateToCreatePage}
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
