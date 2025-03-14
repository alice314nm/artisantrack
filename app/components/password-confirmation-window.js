"use client";

import { useState } from "react";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { auth } from "/app/_utils/firebase";
import { app } from "../_utils/firebase";

export default function PasswordConfirmationWindow({
  windowVisibility,
  onClose,
  onConfirm,
}) {
  const [currentPassword, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleConfirm = async () => {
    if (!currentPassword) {
      setDeleteError("Please enter your password.");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        setDeleteError("No user is signed in.");
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      const db = getFirestore(app);
      await deleteDoc(doc(db, `users/${user.uid}`));
      await deleteUser(user);

      onConfirm();
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setDeleteError("Current password is incorrect.");
      }
    }
  };

  if (!windowVisibility) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 ${
        windowVisibility ? "opacity-100 visible" : "opacity-0 invisible"
      } transition-opacity duration-300 ease-in-out`}
    >
      <div className="bg-beige p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Confirm Password</h2>
        <input
          type="password"
          placeholder="Enter your password"
          value={currentPassword}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-400 rounded p-2 mt-1"
        />
        {deleteError && <p className="text-red mb-4">{deleteError}</p>}
        <div className="flex justify-end gap-4 mt-4">
          <button
            className="bg-red py-2 px-4 rounded-md hover:bg-rose-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green py-2 px-4 rounded-md hover:bg-darkGreen"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
