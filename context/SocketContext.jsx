"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { data: session } = useSession();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: { token: session.user.id },
    });

    s.emit("subscribe", { userId: session.user.id });
    socketRef.current = s;
    setSocket(s);

    return () => {
      s.emit("unsubscribe", { userId: session.user.id });
      s.disconnect();
    };
  }, [session?.user?.id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
