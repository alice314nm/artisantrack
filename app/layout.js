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
  useAutoLogout({ setSessionExpired });
  return null;
}
