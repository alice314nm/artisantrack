"use client";

import { useTranslations } from "use-intl";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth, updateProfile, updateEmail } from "firebase/auth";
import { app } from "@/app/[locale]/_utils/firebase";
import { getUserData } from "@/app/[locale]/_services/user-data";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import { useEffect, useState } from "react";
import ChangePasswordWindow from "@/app/[locale]/components/change-password-window";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import ConfirmationWindow from "@/app/[locale]/components/confirmation-window";
import PasswordConfirmationWindow from "@/app/[locale]/components/password-confirmation-window";

export default function Page() {
  const t = useTranslations('Profile');
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
  const [editableEmail, setEditableEmail] = useState(user?.email || "");
  const [emailConfirmWindowVisibility, setEmailConfirmWindowVisibility] =
    useState(false);
  // New state for tax editing
  const [editableTax, setEditableTax] = useState("");

  // Consistent styling for both view and edit modes
  const sectionStyle = "flex items-center h-9 gap-2"; // Fixed height for consistent spacing
  const inputStyle =
    "p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green";

  useEffect(() => {
    document.title = t('title');
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

  // Add effect to set initial tax value when userData loads
  useEffect(() => {
    if (userData && userData.tax) {
      // Remove % sign if present
      setEditableTax(userData.tax.replace("%", ""));
    }
  }, [userData]);

  const handleAccountDeletion = () => {
    setAccountDeleted(true);
    setTimeout(() => {
      setAccountDeleted(false);
      window.location.href = "/";
    }, 3000);
  };

  const handleSave = async () => {
    if (!editableDisplayName.trim() || saving) return;

    setSaving(true);
    try {
      const db = getFirestore(app);
      const userDoc = doc(db, `users/${user.uid}`);

      // Create update object with all editable fields
      const updateData = {
        displayName: editableDisplayName,
        // Add tax to the update if it's provided
        ...(editableTax.trim() ? { tax: `${editableTax}%` } : {}),
      };

      await updateDoc(userDoc, updateData);

      const auth = getAuth();
      await updateProfile(auth.currentUser, {
        displayName: editableDisplayName,
      });

      setUserData((prevData) => ({
        ...prevData,
        displayName: editableDisplayName,
        ...(editableTax.trim() ? { tax: `${editableTax}%` } : {}),
      }));

      // Check if email needs to be updated
      if (editableEmail !== user.email) {
        setEmailConfirmWindowVisibility(true);
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      if (editableEmail === user.email) {
        setSaving(false);
      }
    }
  };

  const checkEmailVerification = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && user.emailVerified) {
      const db = getFirestore(app);
      const userDoc = doc(db, `users/${user.uid}`);

      await updateDoc(userDoc, {
        email: editableEmail,
      });

      await updateEmail(user, editableEmail);

      setUserData((prevData) => ({
        ...prevData,
        email: editableEmail,
      }));

      setIsEditing(false);
      setEmailConfirmWindowVisibility(false);
      setSaving(false);
    } else {
      console.error("Email not verified.");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditableDisplayName(user.displayName || "");
    setEditableEmail(user.email || "");
    // Reset tax to original value
    if (userData && userData.tax) {
      setEditableTax(userData.tax.replace("%", ""));
    } else {
      setEditableTax("");
    }
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
        <div className="fixed top-0 left-0 w-full font-semibold text-2xl bg-green px-5 py-4 text-center animate-pulse">
          <p>{t('accountDeleted')}</p>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <img
            src="/loading-gif.gif"
            className="h-10"
            data-id="loading-spinner"
          />
        </div>
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
        <Header title={t('title')} />
        <div className="flex flex-col gap-4 overflow-auto pb-16">
          {/* Profile Header with Edit Button */}
          <div className="flex flex-col justify-between  gap-4 border-b border-b-darkBeige px-5 pb-4">
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    data-id="confirm-profile-change"
                    className={`flex items-center gap-2 bg-green py-2 px-4 rounded-md hover:bg-darkGreen transition-all duration-200 ${saving ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <img src="/loading-gif.gif" className="w-5" />
                        <p className="font-semibold">{t('saving')}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">{t('save')}</p>
                        <img src="/Save.png" className="w-5" />
                      </>
                    )}
                  </button>
                  <button
                    className="flex items-center bg-red py-2 px-4 rounded-md hover:bg-rose-800 transition-all duration-200"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    {t('cancel')}
                  </button>
                </>
              ) : (
                <button
                  data-id="edit-profile-button"
                  className="flex items-center gap-2 bg-green py-2 px-4 rounded-md hover:bg-darkGreen transition-all duration-200"
                  onClick={() => setIsEditing(true)}
                >
                  <p className="font-semibold">{t('edit')}</p>
                  <img src="/Pencil.png" className="w-5" />
                </button>
              )}
            </div>
            <div className={sectionStyle}>
              <p className="text-xl font-semibold">{t('artisan')}</p>
              {isEditing ? (
                <input
                  data-id="new-name"
                  type="text"
                  value={editableDisplayName}
                  onChange={(e) => setEditableDisplayName(e.target.value)}
                  className={inputStyle}
                  disabled={saving}
                />
              ) : (
                <p>{user.displayName}</p>
              )}
            </div>
          </div>

          {/* Email Section */}
          <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-4">
            <p className="underline">{t('currentEmail')}</p>
            <div className={sectionStyle}>
              {isEditing ? (
                <input
                  className={`${inputStyle} w-1/5`}
                  data-id="new-email"
                  type="email"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  disabled={saving}
                  style={{ minWidth: "250px" }}
                />
              ) : (
                <p>{user.email || "email@example.com"}</p>
              )}
            </div>
          </div>

          {/* Tax Section */}
          <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-4">
            <p className="underline">{t('setTax')}</p>
            <div className={sectionStyle}>
              {isEditing ? (
                <div className="flex items-center">
                  <input
                    data-id="edit-tax"
                    type="number"
                    value={editableTax}
                    onChange={(e) => setEditableTax(e.target.value)}
                    className={inputStyle}
                    style={{ width: "80px" }}
                    placeholder="0"
                    disabled={saving}
                  />
                  <span className="ml-1">%</span>
                </div>
              ) : (
                <p>{userData?.tax || t('taxNotSet')}</p>
              )}
            </div>
          </div>

          {/* Inventory Section */}
          <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-4">
            <p className="underline">{t('inventory')}</p>
            <div>
              <p className={sectionStyle}>
                {t('totalProducts')}: {userData?.productCount ?? t('loading')}
              </p>
              <p className={sectionStyle}>
                {t('totalMaterials')}: {userData?.materialCount ?? t('loading')}
              </p>
            </div>
            
          </div>

          {/* Orders Section */}
          <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-4">
            <p className="underline">{t('orders')}</p>
            <div>
              <p className={sectionStyle}>
                {t('inProgressOrders')}: {userData?.inProgressOrders ?? t('loading')}
              </p>
              <p className={sectionStyle}>
                {t('completedOrders')}: {userData?.completedOrders ?? t('loading')}
              </p>
            </div>            
          </div>

          {/* Change Password Section */}
          <div className="flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4">
            <button
              data-id="change-password-button"
              className="hover:bg-darkGreen bg-green self-start p-2 rounded-md"
              onClick={openChangePasswordWindow}
            >
              {t('changePassword')}
            </button>
            {confirmWindowVisibility && (
              <ChangePasswordWindow
                windowVisibility={confirmWindowVisibility}
                onClose={closeChangePasswordWindow}
              />
            )}
          </div>

          {/* Delete Account Section */}
          <div className="flex flex-col gap-4 border-b border-b-darkBeige px-5 pb-4">
            <button
              data-id="delete-account"
              className="bg-red text-white self-start p-2 rounded-md hover:bg-rose-800"
              onClick={openDeleteConfirmWindow}
            >
              {t('deleteAccount')}
            </button>
          </div>

          {/* Confirmation Window */}
          <ConfirmationWindow
            windowVisibility={deleteConfirmWindow}
            onClose={closeDeleteConfirmWindow}
            onDelete={onDelete}
          />

          {/* Password Confirmation Window */}
          {passwordConfirmWindow && (
            <PasswordConfirmationWindow
              windowVisibility={passwordConfirmWindow}
              onClose={closePasswordConfirmWindow}
              onConfirm={handleAccountDeletion}
              mode="delete"
            />
          )}

          {/* Email Confirmation Window */}
          {emailConfirmWindowVisibility && (
            <PasswordConfirmationWindow
              windowVisibility={emailConfirmWindowVisibility}
              onClose={() => {
                setEmailConfirmWindowVisibility(false);
                setSaving(false);
              }}
              onConfirm={checkEmailVerification}
              mode="updateEmail"
              newEmail={editableEmail}
            />
          )}

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
