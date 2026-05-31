"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

export default function BookmarkButton({ postId, initialBookmarked }) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  async function toggle(e) {
    e.stopPropagation();
    if (!session) { toast.error("Sign in to bookmark"); return; }
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      if (prev) await axios.delete(`/api/posts/${postId}/bookmark`);
      else { await axios.post(`/api/posts/${postId}/bookmark`); toast.success("Saved to bookmarks"); }
    } catch {
      setBookmarked(prev);
      toast.error("Failed");
    }
  }

  return (
    <button onClick={toggle} title={bookmarked ? "Remove bookmark" : "Save"}
      className={`p-1.5 rounded-full transition ${bookmarked ? "text-indigo-500" : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"}`}>
      <svg className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}
