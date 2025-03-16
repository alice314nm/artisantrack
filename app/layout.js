"use client";

import { useState } from "react";
import "./globals.css";
import { AuthContextProvider } from "./_utils/auth-context";

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="en">
      <head></head>
      <body>
        <AuthContextProvider>
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
