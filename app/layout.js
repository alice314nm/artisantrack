"use client";

import { useState } from "react";
import "./globals.css";
import { AuthContextProvider } from "./_utils/auth-context";

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <style>
          {`
            .chatbot-container {
              position: fixed;
              bottom: 20px;
              right: 20px;
              width: 350px;
              height: 500px;
              background: #FFF7E9;
              color: #22150F;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              overflow: hidden;
              display: ${isOpen ? "block" : "none"};
              z-index: 1000;
            }
            .chatbot-button {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background-color: #A6A968;
              color: #22150F;
              border: none;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              font-size: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              z-index: 1001;
            }
            .chatbot-iframe {
              width: 100%;
              height: 100%;
              border: none;
              background: #FFF7E9;
            }
            /* Chat styling within iframe */
            .chatbase-chat-container {
              background-color: #FFF7E9 !important;
            }
            .chatbase-message-bubble {
              background-color: #FFF8E8 !important;
              color: #22150F !important;
            }
            .chatbase-user-message {
              background-color: #A6A968 !important;
              color: #22150F !important;
            }
            .chatbase-input-box {
              background-color: #FFF8E8 !important;
              color: #22150F !important;
              border: 1px solid #A6A968 !important;
            }
          `}
        </style>
      </head>
      <body>
        <AuthContextProvider>
          {children}
          <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
            💬
          </button>
          <div className="chatbot-container">
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
