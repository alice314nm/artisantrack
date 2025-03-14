"use client";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "../_utils/firebase";
import { getUserData } from "@/app/_services/user-data";
import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import Link from "next/link";
import { useEffect, useState } from "react";
import ChangePasswordWindow from "@/app/components/change-password-window";
import NotLoggedWindow from "@/app/components/not-logged-window";

export default function Page() {
  const { user } = useUserAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [editableDisplayName, setEditableDisplayName] = useState(user?.displayName || "");

  useEffect(() => {
    if (user) {
      getUserData(user, setUserData);
    }
  }, [user]);

  const sectionStyle =
    "flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4";
  const contentStyle = "";

  const handleSave = async () => {
    if (!editableDisplayName.trim()) return;

    try {
      const db = getFirestore(app);
      const userDoc = doc(db, `users/${user.uid}`);
      await updateDoc(userDoc, {
        displayName: editableDisplayName,
      });
      setUserData((prevData) => ({
        ...prevData,
        displayName: editableDisplayName,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setEditableDisplayName(user.displayName || "");
    setIsEditing(false);
  };

  const openChangePasswordWindow = () => {
    setConfirmWindowVisibility(true);
  };

  const closeChangePasswordWindow = () => {
    setConfirmWindowVisibility(false);
  };

  return (
    <div className="flex flex-col min-h-screen gap-4 bg-lightBeige">
      <Header title="Profile" />
      {user ? (
        <div className="flex flex-col gap-4">
          {/* Profile Header */}
          <div className="flex flex-row justify-between items-center gap-4 border-b border-b-darkBeige px-5 pb-4">
            {isEditing ? (
              <div className="flex flex-row gap-4 items-center">
                <p className="text-xl font-semibold">Artisan:</p>
                <input
                  type="text"
                  value={editableDisplayName}
                  onChange={(e) => setEditableDisplayName(e.target.value)}
                  className="border border-gray-400 rounded p-1"
                />
              </div>
            ) : (
              <p className="text-xl font-semibold">
                Artisan: {userData?.displayName || ""}
              </p>
            )}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    className="flex items-center gap-2 bg-green py-2 px-4 rounded-md hover:bg-darkGreen transition-all duration-200"
                    onClick={handleSave}
                  >
                    <p className="font-semibold">Save</p>
                    <img
                      src="/Save.png"
                      className="w-5"
                    />
                  </button>
                  <button
                    className="flex items-center bg-red py-2 px-4 rounded-md hover:bg-rose-800 transition-all duration-200"
                    onClick={handleCancel}
                  >
                    <p className="font-semibold">Cancel</p>

                  </button>
                </>
              ) : (
                <button
                  className="flex items-center gap-2 bg-green py-2 px-4 rounded-md hover:bg-darkGreen transition-all duration-200"
                  onClick={() => setIsEditing(true)}
                >
                  <p className="font-semibold">Edit</p>
                  <img
                    src="/Pencil.png"
                    className="w-5"
                  />
                </button>
              )}
            </div>

          </div>

          {/* Email Section */}
          <div className={sectionStyle}>
            <p>Current email:</p>
            <p className={contentStyle}>{user.email || "email@example.com"}</p>
          </div>

          {/* Change Password Section */}
          <div className={sectionStyle}>
            <button
              data-id="change-password-button"
              className="text-black underline bg-green self-start p-2 rounded-md"
              onClick={openChangePasswordWindow}
            >
              Change Password
            </button>
            {confirmWindowVisibility && (
              <ChangePasswordWindow
                windowVisibility={confirmWindowVisibility}
                onClose={closeChangePasswordWindow}
              />
            )}
          </div>

          {/* Inventory Section */}
          <div className={sectionStyle}>
            <p>Inventory:</p>
            <p className={contentStyle}>
              Total products:{" "}
              {userData ? Math.max(0, userData.productCount) : "Loading..."}
            </p>
            <p className={contentStyle}>
              Total materials:{" "}
              {userData ? Math.max(0, userData.materialCount) : "Loading..."}
            </p>
          </div>

          {/* Orders Section */}
          <div className={sectionStyle}>
            <p>Orders:</p>
            <p className={contentStyle}>
              In progress:{" "}
              {userData ? Math.max(0, userData.inProgressOrders) : "Loading..."}
            </p>
            <p className={contentStyle}>
              Completed:{" "}
              {userData ? Math.max(0, userData.completedOrders) : "Loading..."}
            </p>
          </div>

          {/* Tax Section */}
          <div className={sectionStyle}>
            <p>Set tax: {userData?.tax || "Tax not set"}</p>
          </div>
          <Menu type="OnlySlideMenu" />
        </div>
      ) : (
        <div className="flex flex-col min-h-screen gap-4">
          <Header title="Artisan Track" />
          <NotLoggedWindow />
        </div>
      )}
    </div>
  );
}
