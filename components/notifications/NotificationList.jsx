"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import NotificationItem from "./NotificationItem";

export default function NotificationList() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/notifications")
      .then((r) => {
        setNotifs(r.data.data);
        // Mark all read
        axios.patch("/api/notifications").catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;
  if (notifs.length === 0) return <div className="text-center py-20 text-gray-400">No notifications yet</div>;

  return (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl divide-y dark:divide-gray-800">
      {notifs.map((n) => <NotificationItem key={n._id} notif={n} />)}
    </div>
  );
}
