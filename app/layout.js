"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import { AuthContextProvider } from "./_utils/auth-context";
import { useAutoLogout } from "./components/useAutoLogout";

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
        setLoading(false);
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-beige z-50">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-lg font-semibold">Are you still here?</p>
            <div className="mt-4 flex gap-4 justify-center">
              <button
                onClick={() => {
                  closePopup();
                }}
                className="px-4 py-2 bg-green rounded-md hover:bg-darkGreen"
              >
                Yes, I'm here
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red rounded-md hover:bg-rose-800"
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
