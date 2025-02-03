"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import SignInOutWindow from "@/app/components/sign-in-out-window";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const { user, doSignInUserWithEmailAndPassword, resetPassword } = useUserAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await doSignInUserWithEmailAndPassword(email, password);
      setError("");
      window.location.href = "/";
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/missing-password") {
        setError("Please enter a password to log in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email to log in.");
      } else {
        setError(err.message);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setMessage("Password reset link sent! Check your email.");
      setError("");
      setResetPasswordMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main>
      <Header title="Artisan Track" />
      {user ? (
        <SignInOutWindow type={"SignOut"} />
      ) : (
        <div className="mt-20 flex flex-col items-center">
          {resetPasswordMode ? (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-3 items-center">
              <h2 className="text-2xl font-bold">Reset Password</h2>
              {error && <p className="text-red-500">{error}</p>}
              {message && <p className="text-green-500">{message}</p>}
              <input
                type="email"
                placeholder="Enter your email"
                className="border rounded-lg p-2 w-80 focus:ring-sky-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="bg-green px-6 py-2 rounded-lg font-bold">
                Send Reset Link
              </button>
              <p className="text-sky-500 underline cursor-pointer" onClick={() => setResetPasswordMode(false)}>
                Back to Login
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="flex flex-col gap-3 items-center">
              <h2 className="text-2xl font-bold">Login</h2>
              {error && <p className="text-red-500">{error}</p>}
              <input
                type="email"
                placeholder="Email"
                className="border rounded-lg p-2 w-80 focus:ring-sky-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="border rounded-lg p-2 w-80 focus:ring-sky-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="bg-green px-10 py-2 rounded-lg font-bold">
                Log In
              </button>
              <p className="text-sky-500 underline cursor-pointer" onClick={() => setResetPasswordMode(true)}>
                Forgot password?
              </p>
              <p>
                No account yet?{" "}
                <Link href="/pages/signin">
                  <span className="text-sky-500 underline cursor-pointer">Sign Up</span>
                </Link>
              </p>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
