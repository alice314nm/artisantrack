
'use client'

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import SignInOutWindow from "@/app/components/sign-in-out-window";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const { user, doCreateUserWithEmailAndPassword } = useUserAuth();
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tax, setTax] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputStyle = "w-80 border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500";

  useEffect(() => {
      // Simulating a delay for loading state
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1000); // 1 second delay

      return () => clearTimeout(timeout); // Cleanup timeout
    }, []);

    

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);


    if (!email || !name || !password || !repeatPassword) {
      setError("All fields marked with * are required.");
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await doCreateUserWithEmailAndPassword(email, password, name, tax);
      setSuccess(true);
      window.location.href = "/";

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img src="/loading-gif.gif" className="h-10"/>      
      </div>
    );
  }

  return (
    <main className="">
      <Header title="Artisan Track" />
      {user ? (
        <SignInOutWindow type="SignOut" />
      ) : (
        <form onSubmit={handleSignUp} className="mt-10 flex flex-col gap-4 p-6 items-center justify-center">
          <h2 className="text-xl font-bold">Sign Up</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">Account successfully created!</p>}

          {/* Email */}
          <div className="flex flex-col w-80">
            <label className="text-left">Email <span className="text-red">*</span></label>
            <input type="email" placeholder="eg. example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} required />
          </div>

          {/* Name */}
          <div className="flex flex-col w-80">
            <label className="text-left">Name <span className="text-red">*</span></label>
            <input type="text" placeholder="eg. Alex Smith" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} required />
          </div>

          {/* Tax */}
          <div className="flex flex-col w-80">
            <label className="text-left">Tax</label>
            <input type="text" placeholder="eg. 4%" value={tax} onChange={(e) => setTax(e.target.value)} className={inputStyle} />
          </div>

          {/* Password */}
          <div className="flex flex-col w-80">
            <label className="text-left">Password <span className="text-red">*</span></label>
            <input type="password" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} required />
          </div>

          {/* Repeat Password */}
          <div className="flex flex-col w-80">
            <label className="text-left">Repeat Password <span className="text-red">*</span></label>
            <input type="password" placeholder="*******" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} className={inputStyle} required />
          </div>

          <button
            type="submit"
            className={`bg-green p-2 rounded-xl w-80 font-bold ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"}`}
            disabled={isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>

          <Link href="/login">
            <p className="text-sm text-center">
              Already have account? <span className="underline cursor-pointer text-sky-500">Log in</span>
            </p>
          </Link>
        </form>
      )}
    </main>
  );
}
