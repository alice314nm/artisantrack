"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import { AuthContextProvider } from "./_utils/auth-context";
import { useAutoLogout } from "./[locale]/components/useAutoLogout";

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (sessionExpired) {
      const timeout = setTimeout(() => {
        setSessionExpired(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [sessionExpired]);

  return (
    <html lang="en">
      <head></head>
      <body>
        <AuthContextProvider>
          <AutoLogoutWrapper setSessionExpired={setSessionExpired} />
          {sessionExpired && (
            <div className="fixed top-0 left-0 w-full font-semibold text-2xl bg-green px-5 py-4 text-center animate-pulse">
              Session expired. Please log in again.
            </div>
          )}
          {children}
          <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
            💬
          </button>
          <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
            <iframe
              className="chatbot-iframe"
              src="https://www.chatbase.co/chatbot-iframe/kmR65txIvcHxtGGwZcnT5"
            ></iframe>
          </div>
        </AuthContextProvider>
      </body>
    </html>
  );
}

function AutoLogoutWrapper({ setSessionExpired }) {
  const { showPopup, closePopup, firebaseSignOut } = useAutoLogout({
    setSessionExpired,
  });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    closePopup();
    setTimeout(() => {
      firebaseSignOut().finally(() => {
        window.location.href = "/login";
        setLoading(false);
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-beige z-[9999]">
        <img
          src="/loading-gif.gif"
          className="h-10"
          data-id="loading-spinner"
        />
      </div>
    );
  }

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 transition-opacity duration-300 ease-in-out">
          <div className="bg-beige p-10 rounded-2xl shadow-lg text-center w-[400px] md:w-[500px] lg:w-[600px]">
            <p className="text-2xl font-bold">Are you still here?</p>
            <div className="mt-36 flex gap-6 justify-center">
              <button
                onClick={closePopup}
                className="px-6 py-3 bg-green text-lg rounded-lg hover:bg-darkGreen transition-colors duration-300"
              >
                Yes, I'm here
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red text-lg rounded-lg hover:bg-rose-800 transition-colors duration-300"
              >
                No, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
