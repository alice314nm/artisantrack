"use client";

import { useEffect } from "react";
import { useUserAuth } from "@/app/_utils/auth-context";

const AUTO_LOGOUT_TIME = 2 * 60 * 60 * 1000; // 2 hours

export function useAutoLogout({ setSessionExpired }) {
  const { firebaseSignOut, user } = useUserAuth();

  useEffect(() => {
    if (!firebaseSignOut || !user) return;

    let timeout;
    let isMounted = true;

    const resetTimer = () => {
      if (!isMounted || !user) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (user) {
          setSessionExpired(true);
          firebaseSignOut();
        }
      }, AUTO_LOGOUT_TIME);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [firebaseSignOut, user, setSessionExpired]);
}
