"use client";
import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/context/SocketContext";

export default function SessionProviderWrapper({ children }) {
  return (
    <SessionProvider>
      <SocketProvider>{children}</SocketProvider>
    </SessionProvider>
  );
}
