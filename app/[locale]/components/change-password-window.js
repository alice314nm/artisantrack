"use client";

import { useState } from "react";
import {
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "/app/_utils/firebase";

export default function ChangePasswordWindow({ windowVisibility, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async () => {
    // Check if new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    // Check if new password is empty
    if (newPassword === "") {
      setError("New password cannot be empty.");
      return;
    }

    // Check if new password is at least 6 characters long
    if (newPassword.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        setError("No user is signed in.");
        return;
      }

      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);

      // Success message
      setMessage("Password successfully updated!");
      setError("");

      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000); // Close after 2 seconds
    } catch (error) {
      // Handle specific Firebase errors
      if (error.code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters long.");
      } else {
        setError(error.message);
      }
      console.error("Error updating password:", error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent! Check your email.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProgress = (password) => {
    let strength = 0;

    // Check password length
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) strength += 1;

    // Check for numbers
    if (/[0-9]/.test(password)) strength += 1;

    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Update progress state (out of 5)
    setProgress(strength);
  };

  const getProgressColor = () => {
    if (progress <= 1) return "bg-red"; // Weak
    if (progress <= 3) return "bg-yellow"; // Medium
    return "bg-green"; // Strong
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 ${
        windowVisibility ? "" : "hidden"
      }`}
      data-id="changing-password-window"
    >
      <div className="bg-beige border border-darkBeige rounded-md w-[400px]">
        {/* Conditional Rendering for Password Reset Mode */}
        {resetPasswordMode ? (
          <div className="mt-5 flex flex-col items-center p-5">
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-3 items-center"
            >
              <h2 className="text-2xl font-bold">Reset Password</h2>
              {error && <p className="text-red-500">{error}</p>}
              {message && <p className="text-green-500">{message}</p>}
              <input
                type="email"
                placeholder="Enter your email"
                className="border rounded-lg p-2 w-80 focus:ring-sky-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="bg-green px-6 py-2 rounded-lg font-bold"
              >
                Send Reset Link
              </button>
              <p
                className="text-sky-500 underline cursor-pointer"
                onClick={() => setResetPasswordMode(false)}
              >
                Back to Change Password
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-b-darkBeige">
              <p
                className="py-8 px-4 text-center font-bold text-3xl"
                data-id="changing-password-text"
              >
                Change Password
              </p>
            </div>

            {/* Password Change Form */}
            <div className="px-4 py-4">
              {/* Current Password */}
              <div className="mb-4">
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium"
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    data-id="current-password"
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-400 rounded p-2 mt-1"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <img
                      src={
                        showCurrentPassword ? "/eye.png" : "/eye-crossed.png"
                      }
                      alt="Toggle visibility"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    data-id="new-password"
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      handleProgress(e.target.value); // Update progress on every keystroke
                    }}
                    className="w-full border border-gray-400 rounded p-2 mt-1"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <img
                      src={showNewPassword ? "/eye.png" : "/eye-crossed.png"}
                      alt="Toggle visibility"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor()}`}
                    style={{ width: `${(progress / 5) * 100}%` }}
                  ></div>
                </div>
                {/* Progress Text */}
                <p className="text-sm mt-1">
                  {progress <= 1 ? "Weak" : progress <= 3 ? "Medium" : "Strong"}
                </p>
              </div>

              {/* Confirm New Password */}
              <div className="mb-4">
                <label
                  htmlFor="confirm-new-password"
                  className="block text-sm font-medium"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    data-id="confirm-new-password"
                    id="confirm-new-password"
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full border border-gray-400 rounded p-2 mt-1"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() =>
                      setShowConfirmNewPassword(!showConfirmNewPassword)
                    }
                  >
                    <img
                      src={
                        showConfirmNewPassword ? "/eye.png" : "/eye-crossed.png"
                      }
                      alt="Toggle visibility"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-red text-sm mb-4 font-semibold text-center">
                  {error}
                </p>
              )}

              {/* Success message */}
              {message && (
                <p className="text-green text-sm mb-4 font-semibold text-center">
                  {message}
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between font-bold gap-3">
                  <button
                    data-id="change-button"
                    className="flex-1 text-center text-red border-r border-darkBeige p-2 bg-green rounded-full hover:bg-darkGreen"
                    onClick={handleSubmit}
                  >
                    Change
                  </button>
                  <button
                    className="flex-1 text-center p-2 bg-green rounded-full hover:bg-darkGreen"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>

                {/* Forgot Password Link */}
                <button
                  type="button"
                  className="text-sm text-blue-500 underline"
                  onClick={() => setResetPasswordMode(true)}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
