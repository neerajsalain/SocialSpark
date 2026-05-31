"use client";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function LikeButton({ postId, initialLiked = false, initialCount = 0 }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session) { toast.error("Sign in to like posts"); return; }
    setLoading(true);
    setLiked(!liked);
    setCount((c) => c + (liked ? -1 : 1));
    try {
      if (liked) {
        await axios.delete(`/api/posts/${postId}/like`);
      } else {
        await axios.post(`/api/posts/${postId}/like`);
      }
    } catch {
      setLiked(liked);
      setCount((c) => c + (liked ? 1 : -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={toggle} disabled={loading} className={`flex items-center gap-1.5 transition ${liked ? "text-red-500" : "hover:text-red-500"}`}>
      <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {count}
    </button>
  );
}
