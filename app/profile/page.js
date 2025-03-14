"use client";

import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";
import { app } from "../_utils/firebase";
import { getUserData } from "@/app/_services/user-data";
import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import { useEffect, useState } from "react";
import ChangePasswordWindow from "@/app/components/change-password-window";
import NotLoggedWindow from "@/app/components/not-logged-window";
import ConfirmationWindow from "@/app/components/confirmation-window";
import PasswordConfirmationWindow from "@/app/components/password-confirmation-window";

export default function Page() {
  const { user } = useUserAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [editableDisplayName, setEditableDisplayName] = useState(
    user?.displayName || ""
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmWindow, setDeleteConfirmWindow] = useState(false);
  const [passwordConfirmWindow, setPasswordConfirmWindow] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        await getUserData(user, setUserData);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAccountDeletion = () => {
    setAccountDeleted(true);
    setTimeout(() => {
      setAccountDeleted(false);
    }, 4000);
  };

  const handleSave = async () => {
    if (!editableDisplayName.trim() || saving) return;

    setSaving(true);
    try {
      const db = getFirestore(app);
      const userDoc = doc(db, `users/${user.uid}`);

      await updateDoc(userDoc, {
        displayName: editableDisplayName,
      });

      const auth = getAuth();
      await updateProfile(auth.currentUser, {
        displayName: editableDisplayName,
      });

      setUserData((prevData) => ({
        ...prevData,
        displayName: editableDisplayName,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditableDisplayName(user.displayName || "");
    setIsEditing(false);
  };

  const onDelete = async () => {
    closeDeleteConfirmWindow();
    openPasswordConfirmWindow();
  };

  const openChangePasswordWindow = () => {
    setConfirmWindowVisibility(true);
  };

  const closeChangePasswordWindow = () => {
    setConfirmWindowVisibility(false);
  };

  const openDeleteConfirmWindow = () => {
    setDeleteConfirmWindow(true);
  };

  const closeDeleteConfirmWindow = () => {
    setDeleteConfirmWindow(false);
  };

  const openPasswordConfirmWindow = () => {
    setPasswordConfirmWindow(true);
  };

  const closePasswordConfirmWindow = () => {
    setPasswordConfirmWindow(false);
  };

  if (accountDeleted && !user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Profile" />
        <div className="fixed top-0 left-0 w-full font-semibold text-2xl bg-green px-5 py-4 text-center animate-pulse">
          <p>Account successfully deleted!</p>
        </div>
        <NotLoggedWindow />
      </div>
    );
  }

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
      <div className="flex flex-col min-h-screen gap-4 bg-lightBeige">
        <Header title="Profile" />
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
                  disabled={saving}
                />
              </div>
            ) : (
              <p className="text-xl font-semibold">
                Artisan: {user.displayName}
              </p>
            )}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    className={`flex items-center gap-2 bg-green py-2 px-4 rounded-md hover:bg-darkGreen transition-all duration-200 ${
                      saving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <img src="/loading-gif.gif" className="w-5" />
                        <p className="font-semibold">Saving...</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">Save</p>
                        <img src="/Save.png" className="w-5" />
                      </>
                    )}
                  </button>
                  <button
                    className="flex items-center bg-red py-2 px-4 rounded-md hover:bg-rose-800 transition-all duration-200"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="flex items-center gap-2 bg-green py-2 px-4 rounded-md hover:bg-darkGreen transition-all duration-200"
                  onClick={() => setIsEditing(true)}
                >
                  <p className="font-semibold">Edit</p>
                  <img src="/Pencil.png" className="w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Email Section */}
          <div className="flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4">
            <p className="underline">Current email:</p>
            <p>{user.email || "email@example.com"}</p>
          </div>

          {/* Change Password Section */}
          <div className="flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4">
            <button
              data-id="change-password-button"
              className="text-black bg-green self-start p-2 rounded-md"
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
          <div className="flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4">
            <p className="underline">Inventory:</p>
            <p>Total products: {userData?.productCount ?? "Loading..."}</p>
            <p>Total materials: {userData?.materialCount ?? "Loading..."}</p>
          </div>

          {/* Orders Section */}
          <div className="flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4">
            <p className="underline">Orders:</p>
            <p>In progress: {userData?.inProgressOrders ?? "Loading..."}</p>
            <p>Completed: {userData?.completedOrders ?? "Loading..."}</p>
          </div>

          {/* Tax Section */}
          <div className="flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4">
            <p>Set tax: {userData?.tax || "Tax not set"}</p>
          </div>

          {/* Delete Account Section */}
          <div className="flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4">
            <button
              className="bg-red self-start p-2 rounded-md hover:bg-rose-800"
              onClick={openDeleteConfirmWindow}
            >
              Delete Account
            </button>
          </div>

          {/* Confirmation Window */}
          <ConfirmationWindow
            windowVisibility={deleteConfirmWindow}
            onClose={closeDeleteConfirmWindow}
            onDelete={onDelete}
          />

          {/* Password Confirmation Window */}
          <PasswordConfirmationWindow
            windowVisibility={passwordConfirmWindow}
            onClose={closePasswordConfirmWindow}
            onConfirm={handleAccountDeletion}
          />

          <Menu type="OnlySlideMenu" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Profile" />
        <NotLoggedWindow />
      </div>
    );
  }
}
