"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";

export function useNotificationCount() {
  const [count, setCount] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    axios.get("/api/notifications").then((r) => {
      setCount(r.data.data?.filter((n) => !n.isRead).length || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    function handler() { setCount((c) => c + 1); }
    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [socket]);

  return count;
}
