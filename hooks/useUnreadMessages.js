"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";

export function useUnreadMessages() {
  const socket = useSocket();
  const [count, setCount] = useState(0);

  useEffect(() => {
    axios.get("/api/conversations")
      .then(({ data }) => {
        if (data.success) {
          const total = data.data.reduce((sum, c) => sum + (c.unread || 0), 0);
          setCount(total);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => setCount((n) => n + 1);
    socket.on("dm:receive", handler);
    return () => socket.off("dm:receive", handler);
  }, [socket]);

  return count;
}
