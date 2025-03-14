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
import { initializeUserData } from "../_services/user-data";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

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
        throw new Error(
          "This email address is already associated with an account."
        );
      }
      throw new Error(error.message);
    }
  };

  const doSignInUserWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error) {
      console.error("Error resetting password: ", error.message);
      alert("Error sending password reset email. Please try again.");
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
