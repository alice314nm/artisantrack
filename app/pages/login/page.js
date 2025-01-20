"use client"; // Ensure this is at the top to make this a client component

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Correctly import useRouter
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { auth } from "@/_utils/firebase";
import Header from "@/components/header";
import SignInOutWindow from "@/components/sign-in-out-window";

export default function LoginPage() {
  const router = useRouter(); // Initialize useRouter here
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
      });
  
      // Cleanup subscription on unmount
      return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login Successful! Redirecting...");
      console.log(userCredential.user);
      router.push("/"); // Redirect to a dashboard or home page
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <main>
      <Header title="Artisan Track" />

      {
        user ? (

             <SignInOutWindow type={"SignOut"}/>

        ) : (
          <div>
            <form className="mt-20 flex flex-col gap-3 items-center" onSubmit={handleLogin}>
              <h2 className="text-2xl font-bold">Login</h2>
              <input
                type="email"
                placeholder="Email"
                className="border rounded-lg p-2 w-80"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="border rounded-lg p-2 w-80"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className="bg-green px-10 py-2 rounded-lg"
              >
                Log In
              </button>
              <p className="text-green-500">{message}</p>
              <p>
                No account yet?{" "}
                <Link href="/pages/signin">
                  <span className="text-blue-500 cursor-pointer">Sign Up</span>
                </Link>
              </p>
            </form>
          </div>
        )
      }
      
    </main>
  );
}
