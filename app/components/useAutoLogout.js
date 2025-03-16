import { useEffect } from "react";
import { useUserAuth } from "@/app/_utils/auth-context";

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes

export function useAutoLogout() {
  const { firebaseSignOut } = useUserAuth();

  useEffect(() => {
    if (!firebaseSignOut) return;

    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        firebaseSignOut();
      }, AUTO_LOGOUT_TIME);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [firebaseSignOut]);
}
