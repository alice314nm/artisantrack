"use client";

import Header from "@/app/components/header";
import SignInOutWindow from "@/app/components/sign-in-out-window";
import Link from "next/link";
import { useEffect, useState } from "react";


// import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { auth, db } from "@/_utils/firebase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tax, setTax] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //         setUser(currentUser);
  //     });
  
  //     // Cleanup subscription on unmount
  //     return () => unsubscribe();
  // }, []);

  // const handleSignIn = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setSuccess(false);

  //   if (!email || !name || !password || !repeatPassword) {
  //     setError("All fields are required.");
  //     return;
  //   }

  //   if (password !== repeatPassword) {
  //     setError("Passwords do not match.");
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  //     const user = userCredential.user;

  //     // Save additional user data in Firestore
  //     await setDoc(doc(db, "users", user.uid), {
  //       name: name,
  //       email: email,
  //       tax: tax || null,
  //     });

  //     setSuccess(true);
  //     setIsLoading(false);
  //   } catch (err) {
  //     setError(err.message);
  //     setIsLoading(false);
  //   }
  // };

  return (
    <main className="">
      <Header title="Artisan Track" />
      {
        user? (
          <SignInOutWindow type="SignOut"/>
        ) : (
          <form
          // onSubmit={handleSignIn}
          className="mt-10 flex flex-col gap-5 p-6 items-center justify-center"
        >
          <h2 className="text-xl font-bold">Sign In</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">Account successfully created!</p>}
  
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-80 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 mt-3"
            required
          />
  
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-80 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 mt-3"
            required
          />
  
          <input
            type="text"
            placeholder="Tax (optional)"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className="w-80 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 mt-3"
          />
  
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-80 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 mt-3"
            required
          />
          
          <input
            type="password"
            placeholder="Repeat Password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className="w-80 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 mt-3"
            required
          />
  
          <button
            type="submit"
            className={`bg-green p-2 rounded w-80 mt-4 font-bold ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
  
          <Link href="/pages/login">
            <p className="underline text-sky-500 text-sm cursor-pointer hover:underline mt-4 text-center">
              Back to Login
            </p>
          </Link>
        </form>
        )
      }

    </main>
  );
}