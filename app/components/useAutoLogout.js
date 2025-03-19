"use client";

import { useEffect, useState, useRef } from "react";
import { useUserAuth } from "@/app/_utils/auth-context";

const AUTO_LOGOUT_TIME = 2 * 60 * 60 * 1000; // 2 hours
const POPUP_TIME = AUTO_LOGOUT_TIME - 30 * 60 * 1000; // 1 hour 30 minutes

export function useAutoLogout({ setSessionExpired }) {
  const { firebaseSignOut, user } = useUserAuth();
  const [showPopup, setShowPopup] = useState(false);
  const popupActive = useRef(false);

  useEffect(() => {
    if (!firebaseSignOut || !user) return;

    let timeout;
    let popupTimeout;
    let isMounted = true;

    const resetTimer = () => {
      if (!isMounted || !user || popupActive.current) return; // Skip if popup is active
      clearTimeout(timeout);
      clearTimeout(popupTimeout);

      // Start popup timer after 1:30 hours
      popupTimeout = setTimeout(() => {
        if (isMounted && user) {
          setShowPopup(true);
          popupActive.current = true;
        }
      }, POPUP_TIME);

      // Start auto logout timer after 2 hours
      timeout = setTimeout(() => {
        if (isMounted && user) {
          setSessionExpired(true);
          firebaseSignOut(); // Log out after 2 hours if no response
        }
      }, AUTO_LOGOUT_TIME);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      clearTimeout(popupTimeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [firebaseSignOut, user, setSessionExpired]);

  const closePopup = () => {
    setShowPopup(false);
    popupActive.current = false;
  };

  // Return firebaseSignOut directly
  return { showPopup, closePopup, firebaseSignOut };
}
