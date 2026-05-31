"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Avatar from "@/components/shared/Avatar";
import { timeAgo } from "@/utils/formatTime";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

function CommentItem({ comment }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(comment.likesCount || 0);

  async function toggleLike() {
    if (!session) return;
    const prev = liked;
    setLiked(!prev);
    setCount((c) => c + (prev ? -1 : 1));
    try {
      if (prev) await axios.delete(`/api/comments/${comment._id}/like`);
      else await axios.post(`/api/comments/${comment._id}/like`);
    } catch {
      setLiked(prev);
      setCount((c) => c + (prev ? 1 : -1));
    }
  }

  return (
    <div className="flex gap-3">
      <Avatar src={comment.author?.avatar} name={comment.author?.name} size={32} />
      <div className="flex-1">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author?.name}</span>
              <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
            </div>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
        {/* Like button */}
        <button onClick={toggleLike}
          className={`flex items-center gap-1 mt-1 ml-2 text-xs transition ${liked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}>
          <svg className="w-3.5 h-3.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          {count > 0 && <span>{count}</span>}
        </button>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`/api/posts/${postId}/comments`).then((r) => setComments(r.data.data)).catch(() => {});
  }, [postId]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(`/api/posts/${postId}/comments`, { content: text });
      setComments((prev) => [data.data, ...prev]);
      setText("");
    } catch {
      toast.error("Failed to comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
      {session && (
        <form onSubmit={submit} className="flex gap-3 mb-4">
          <Avatar src={session.user?.image} name={session.user?.name} size={32} />
          <div className="flex-1 flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…"
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" disabled={submitting || !text.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50 transition">
              Post
            </button>
          </div>
        </form>
      )}
      <div className="space-y-3">
        {comments.map((c) => <CommentItem key={c._id} comment={c} />)}
        {comments.length === 0 && <p className="text-center text-gray-400 text-sm py-3">No comments yet. Be the first!</p>}
      </div>
    </div>
  );
}
