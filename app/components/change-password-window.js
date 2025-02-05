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

  const handleSubmit = async () => {
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword === "") {
      setError("New password cannot be empty.");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        setError("No user is signed in.");
        return;
      }
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage("Password successfully updated!");
      setError("");
      onClose();
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
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
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between font-bold gap-3">
                  <button
                    className="flex-1 text-center text-red border-r border-darkBeige p-2 bg-yellow rounded-full hover:bg-[#FFD369]"
                    onClick={handleSubmit}
                  >
                    Change
                  </button>
                  <button
                    className="flex-1 text-center p-2 bg-yellow rounded-full hover:bg-[#FFD369]"
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
