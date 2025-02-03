import { useState } from "react";

export default function ChangePasswordWindow({ windowVisibility, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSubmit = () => {
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword === "") {
      setError("New password cannot be empty.");
      return;
    }
    setError("");
    onClose();
  };

  const handleForgotPassword = () => {
    alert("Redirecting to Forgot Password...");
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 ${windowVisibility ? "" : "hidden"
        }`}
      data-id="changing-password-window"
    >
      <div className="bg-beige border border-darkBeige rounded-md w-[400px]">
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
                  src={showCurrentPassword ? "/eye.png" : "/eye-crossed.png"}
                  alt="Toggle visibility"
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label htmlFor="new-password" className="block text-sm font-medium">
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
                  src={showConfirmNewPassword ? "/eye.png" : "/eye-crossed.png"}
                  alt="Toggle visibility"
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between font-bold">
              <button
                className="flex-1 text-center text-red border-r border-darkBeige p-2"
                onClick={handleSubmit}
              >
                Change
              </button>
              <button className="flex-1 text-center p-2" onClick={onClose}>
                Cancel
              </button>
            </div>

            {/* Forgot Password Link */}
            <button
              type="button"
              className="text-sm text-blue-500 underline"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
