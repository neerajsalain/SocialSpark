import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/components/shared/SessionProviderWrapper";

export const metadata = {
  title: "SocialSpark",
  description: "Connect, share, and discover.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProviderWrapper>
          {children}
          <Toaster position="top-center" />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
