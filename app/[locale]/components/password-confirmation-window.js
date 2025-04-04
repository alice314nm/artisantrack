"use client";

import { useTranslations } from "use-intl";
import { useState, useEffect } from "react";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { auth } from "@/app/[locale]/_utils/firebase";
import { app } from "@/app/[locale]/_utils/firebase";

export default function PasswordConfirmationWindow({
  windowVisibility,
  onClose,
  onConfirm,
  mode,
  newEmail,
}) {
  const t = useTranslations('PasswordConfirmation');
  const [currentPassword, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  const resendVerificationEmail = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError(t('errors.noUserSignedIn'));
        return;
      }

      await verifyBeforeUpdateEmail(user, newEmail, {
        url: "http://localhost:3000",
      });

      setError(t('messages.verificationEmailSent', { email: newEmail }));
      setCountdown(10);
    } catch (error) {
      setError(t('errors.verificationFailed', { message: error.message }));
    }
  };

  const handleConfirm = async () => {
    if (!currentPassword) {
      setError(t('errors.enterPassword'));
      return;
    }

    // Check if the new email is the same as the current email
    const user = auth.currentUser;
    if (!user) {
      setError(t('errors.noUserSignedIn'));
      return;
    }

    if (mode === "delete") {
      try {
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
          setError(t('errors.incorrectPassword'));
        } else {
          setError(error.message);
        }
      }
      return;
    }

    if (!newEmail) {
      setError(t('errors.enterNewEmail'));
      return;
    }

    if (newEmail === user.email) {
      setError(t('errors.sameEmail'));
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      if (mode === "updateEmail" && newEmail) {
        try {
          await resendVerificationEmail();
          setIsVerificationSent(true);
        } catch (error) {
          setError(t('errors.verificationFailed', { message: error.message }));
        }
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 ${windowVisibility ? "opacity-100 visible" : "opacity-0 invisible"
        } transition-opacity duration-300 ease-in-out`}
    >
      <div className="bg-beige p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">{t('heading')}</h2>

        {!isVerificationSent ? (
          <>
            <input
              data-id="confirm-password"
              type="password"
              placeholder={t('placeholders.password')}
              value={currentPassword}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-400 rounded p-2 mt-1"
            />
            {error && <p className="text-red mb-4">{error}</p>}

            <div className="flex justify-end gap-4 mt-4">
              <button
                className="bg-red py-2 px-4 rounded-md hover:bg-rose-800"
                onClick={onClose}
              >
                {t('buttons.cancel')}
              </button>
              <button
                data-id="confirm-button-email-delete/change"
                className="bg-green py-2 px-4 rounded-md hover:bg-darkGreen"
                onClick={handleConfirm}
              >
                {t('buttons.confirm')}
              </button>
            </div>
          </>
        ) : (
          <div>
            <p className="mb-4">
              {t('messages.verificationSent')} <strong>{newEmail}</strong>.
              {t('messages.checkAndRefresh')}
            </p>

            {countdown > 0 ? (
              <p className="text-gray-600 mb-2">
                {t('messages.resendIn', { seconds: countdown })}
              </p>
            ) : (
              <button
                className="bg-green py-2 px-4 rounded-md hover:bg-darkGreen w-full mb-2"
                onClick={resendVerificationEmail}
              >
                {t('buttons.resend')}
              </button>
            )}

            <button
              className="bg-green py-2 px-4 rounded-md hover:bg-darkGreen w-full"
              onClick={onClose}
            >
              {t('buttons.close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
