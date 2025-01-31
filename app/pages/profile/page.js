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
  const [user, setUser] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [changePasswordVisibility, setChangePasswordVisibility] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Olga Ivanova",
    email: "email@example.com",
    tax: 4,
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  const openChangePasswordWindow = () => {
    setChangePasswordVisibility(true);
  };

  const closeChangePasswordWindow = () => {
    setChangePasswordVisibility(false);
  };


  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Profile" userName={profileData.name} />

        <div className="flex flex-row justify-between gap-2 border-b border-b-darkBeige px-5 pb-3">
          {isEditing ? (
            <input
              type="text"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              className="border border-gray-400 rounded p-1"
            />
          ) : (
            <p className="underline">
              Artisan: <br /> {profileData.name}
            </p>
          )}
          <button
            className="flex flex-row h-8 bg-green w-20 gap-2 items-center justify-center py-1 rounded-lg"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            <p className="font-bold">{isEditing ? "Save" : "Edit"}</p>
            <img
              src={isEditing ? "/Save.png" : "/Pencil.png"}
              className="w-5"
            />
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p className="underline">Current email:</p>
          {isEditing ? (
            <input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              className="border border-gray-400 rounded p-1 w-[300px]"
            />
          ) : (
            <p>{profileData.email}</p>
          )}
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
          {isEditing ? (
            <input
              type="number"
              value={profileData.tax}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  tax: e.target.value,
                })
              }
              className="border border-gray-400 rounded p-1 w-[100px]"
            />
          ) : (
            <p>{profileData.tax}%</p>
          )}
        </div>

        <Menu type="OnlySlideMenu" />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Artisan Track" />
        <div className="fixed w-screen h-screen flex flex-col text-center items-center justify-center gap-4">
          <p>
            Create account to start your <br /> artisan track
          </p>
          <button className="font-bold bg-green py-2 px-4 rounded-lg">
            Sign in
          </button>
        </div>
      </div>
    );
  }
}
