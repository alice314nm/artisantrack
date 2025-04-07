"use client";

import { useContext, createContext, useState, useEffect } from "react";
import {
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { initializeUserData } from "@/app/[locale]/_services/user-data";
import { useTranslations } from "next-intl";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const t = useTranslations("auth");

  const doCreateUserWithEmailAndPassword = async (
    email,
    password,
    displayName,
    tax
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: displayName,
      });

      await initializeUserData(user, db, displayName, tax);

      return user;
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        // Use the translation key directly
        throw new Error(t("errors.emailInUse"));
      }
      throw new Error(error.message);
    }
  };

  const doSignInUserWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = async (email) => {
    if (!email) {
      throw new Error(t("errors.invalidEmail"));
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error(`${t("passwordReset.error")} ${error.message}`);
    }
  };

  const firebaseSignOut = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseSignOut,
        doCreateUserWithEmailAndPassword,
        doSignInUserWithEmailAndPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useUserAuth = () => {
  return useContext(AuthContext);
};
