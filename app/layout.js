import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "./_utils/auth-context";

export const metadata = {
  title: "Artisan Track",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>{children}</AuthContextProvider>

        {/* Chatbot Widget (Embedded iFrame) */}
        <iframe 
          src="https://aichatbot-c73f2.web.app/" 
          width="400" 
          height="500" 
          style={{
            position: "fixed", 
            bottom: "20px", 
            right: "20px", 
            borderRadius: "10px", 
            border: "1px solid #ccc", 
            boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
            zIndex: 1000, 
            backgroundColor: "white",
          }}
        ></iframe>
      </body>
      
    </html>
  );
}
