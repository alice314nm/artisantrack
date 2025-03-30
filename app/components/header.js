"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useUserAuth } from "../_utils/auth-context";
import LanguageSwitcher from "./language-switcher";

/*
    Header - component for header on page

    props:
    - title - title for the current page
    - showUserName - true: show header with user name
*/

export default function Header({ title, showUserName }) {
  const { user } = useUserAuth();

  useEffect(() => {}, [user]);

  return (
    <header className="bg-beige font-bold flex flex-row p-2 px-4 items-center justify-between">
      <div className="gap-4 flex flex-row items-center justify-between">
        <Link href="/">
          <img src="/LogoArtisanTrack.png" className="w-12 h-12 border" />
        </Link>
        <p className="italic text-2xl">{title}</p>
      </div>
      {/* <LanguageSwitcher /> */}
    </header>
  );
}
