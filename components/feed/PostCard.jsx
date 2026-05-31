"use client";
import Link from "next/link";
import Image from "next/image";
import Avatar from "@/components/shared/Avatar";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { timeAgo } from "@/utils/formatTime";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import CommentSection from "./CommentSection";

export default function PostCard({ post, onDelete, showPin = false, isPinned = false }) {
  const { data: session } = useSession();
  const [sharing, setSharing] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [pinned, setPinned] = useState(isPinned);
  const isOwn = session?.user?.id === String(post.author?._id);

  async function handleShare() {
    setSharing(true);
    try {
      await axios.post(`/api/posts/${post._id}/share`);
      toast.success("Reposted!");
    } catch { toast.error("Failed to repost"); }
    finally { setSharing(false); }
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    try {
      await axios.delete(`/api/posts/${post._id}`);
      toast.success("Post deleted");
      onDelete?.(post._id);
    } catch { toast.error("Failed to delete"); }
    setMenuOpen(false);
  }

  async function handlePin() {
    try {
      if (pinned) {
        await axios.delete(`/api/posts/${post._id}/pin`);
        setPinned(false);
        toast.success("Post unpinned");
      } else {
        await axios.post(`/api/posts/${post._id}/pin`);
        setPinned(true);
        toast.success("Post pinned to profile");
      }
    } catch { toast.error("Failed"); }
    setMenuOpen(false);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    toast.success("Link copied!");
    setMenuOpen(false);
  }

  function renderContent(text) {
    if (!text) return null;
    return text.split(/(#\w+|@\w+)/g).map((part, i) => {
      if (part.startsWith("#")) return <Link key={i} href={`/explore?tag=${part.slice(1)}`} className="text-indigo-500 hover:text-indigo-600 font-medium">{part}</Link>;
      if (part.startsWith("@")) return <Link key={i} href={`/profile/${part.slice(1)}`} className="text-indigo-500 hover:text-indigo-600 font-medium">{part}</Link>;
      return part;
    });
  }

  return (
    <article className="card-hover p-5 group transition-all duration-200">
      {/* Pinned badge */}
      {pinned && (
        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold mb-3 pb-3 border-b border-amber-100 dark:border-amber-900/30">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z"/></svg>
          Pinned post
        </div>
      )}

      {post.isRepost && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Reposted
        </div>
      )}

      <div className="flex gap-3.5">
        <Link href={`/profile/${post.author?.username}`} className="shrink-0 mt-0.5">
          <Avatar src={post.author?.avatar} name={post.author?.name} size={42} />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-tight">
              <Link href={`/profile/${post.author?.username}`} className="font-bold text-[15px] hover:underline">{post.author?.name}</Link>
              {post.author?.isVerified && (
                <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              )}
              <span className="text-gray-400 text-sm font-normal">@{post.author?.username}</span>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <Link href={`/post/${post._id}`} className="text-gray-400 text-sm hover:text-gray-600 dark:hover:text-gray-300 transition">{timeAgo(post.createdAt)}</Link>
            </div>

            {/* Menu */}
            <div className="relative shrink-0">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all lg:opacity-0 lg:group-hover:opacity-100">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-popup border border-gray-100 dark:border-gray-800 py-1.5 z-30 animate-in">
                  <Link href={`/post/${post._id}`} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    View post
                  </Link>
                  <button onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    Copy link
                  </button>
                  {isOwn && showPin && (
                    <button onClick={handlePin}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z"/></svg>
                      {pinned ? "Unpin post" : "Pin to profile"}
                    </button>
                  )}
                  {isOwn && (
                    <>
                      <hr className="my-1 border-gray-100 dark:border-gray-800" />
                      <button onClick={handleDelete}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Delete post
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sensitive warning */}
          {post.isSensitive && !revealed && post.media?.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold mb-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              Sensitive content
            </div>
          )}

          {/* Content */}
          {post.content && (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">{renderContent(post.content)}</p>
          )}

          {/* Media */}
          {post.media?.length > 0 && (
            <div className={`mt-3.5 grid gap-1.5 rounded-2xl overflow-hidden ${post.media.length > 1 ? "grid-cols-2" : ""} relative`}>
              {post.isSensitive && !revealed && (
                <button onClick={() => setRevealed(true)}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-xl gap-2 rounded-2xl">
                  <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  <span className="text-white text-sm font-semibold">Tap to reveal</span>
                </button>
              )}
              {post.media.map((m, i) =>
                m.type === "video" ? (
                  <video key={i} src={m.url} controls className={`w-full max-h-96 object-cover ${post.isSensitive && !revealed ? "blur-2xl" : ""}`} />
                ) : (
                  <div key={i} className="relative overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ aspectRatio: post.media.length === 1 ? "16/9" : "1/1" }}>
                    <Image src={m.url} alt="post media" fill className={`object-cover ${post.isSensitive && !revealed ? "blur-2xl" : ""}`} />
                  </div>
                )
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3.5 -ml-1.5">
            <div className="flex items-center gap-0.5">
              <LikeButton postId={post._id} initialLiked={post.liked} initialCount={post.likesCount} />

              <button onClick={() => setCommentsOpen(!commentsOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium transition-all ${commentsOpen ? "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
              </button>

              {session && (
                <button onClick={handleShare} disabled={sharing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all disabled:opacity-40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  {post.sharesCount > 0 && <span>{post.sharesCount}</span>}
                </button>
              )}

              {post.viewsCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-300 dark:text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  {post.viewsCount}
                </span>
              )}
            </div>
            <BookmarkButton postId={post._id} initialBookmarked={post.bookmarked} />
          </div>

          {commentsOpen && <CommentSection postId={post._id} />}
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />}
    </article>
  );
}
