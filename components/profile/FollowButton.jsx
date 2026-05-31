"use client";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function FollowButton({ userId, initialFollowing = false, compact = false }) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!session || session.user.id === userId) return null;

  async function toggle() {
    setLoading(true);
    setFollowing(!following);
    try {
      if (following) await axios.delete(`/api/users/${userId}/follow`);
      else { await axios.post(`/api/users/${userId}/follow`); toast.success("Following!"); }
    } catch {
      setFollowing(following);
      toast.error("Action failed");
    } finally { setLoading(false); }
  }

  if (compact) {
    return (
      <button onClick={toggle} disabled={loading}
        className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${following ? "border dark:border-gray-700 hover:border-red-300 hover:text-red-500 text-gray-600 dark:text-gray-400" : "bg-indigo-600 hover:bg-indigo-700 text-white"} disabled:opacity-60`}>
        {following ? "Following" : "Follow"}
      </button>
    );
  }

  return (
    <button onClick={toggle} disabled={loading}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`px-5 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-60 ${
        following
          ? hovered
            ? "border border-red-300 text-red-500 dark:border-red-800"
            : "border dark:border-gray-700 text-gray-700 dark:text-gray-300"
          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm shadow-indigo-500/20"
      }`}>
      {following ? (hovered ? "Unfollow" : "Following") : "Follow"}
    </button>
  );
}
