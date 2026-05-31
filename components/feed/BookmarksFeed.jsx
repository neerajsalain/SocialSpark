"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "./PostCard";

export default function BookmarksFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/bookmarks")
      .then((r) => setPosts(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => String(p._id) !== id));
  }

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
          <div className="flex gap-3"><div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800" /><div className="flex-1 space-y-2 pt-1"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" /><div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl mt-3" /></div></div>
        </div>
      ))}
    </div>
  );

  if (posts.length === 0) return (
    <div className="text-center py-20 text-gray-500">
      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
      </svg>
      <p className="font-semibold text-lg">No bookmarks yet</p>
      <p className="text-sm mt-1">Save posts by tapping the bookmark icon</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {posts.map((post) => <PostCard key={post._id} post={post} onDelete={handleDelete} />)}
    </div>
  );
}
