"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "@/components/shared/Avatar";
import FollowButton from "./FollowButton";

export default function ProfileHeader({ user, session }) {
  const router = useRouter();
  const [msgLoading, setMsgLoading] = useState(false);
  const isOwn = session?.user?.id === String(user._id);

  async function handleMessage() {
    setMsgLoading(true);
    try {
      const { data } = await axios.post("/api/conversations", { recipientId: String(user._id) });
      if (data.success) router.push("/messages");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Cannot message this user");
    } finally { setMsgLoading(false); }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-4">
      {/* Cover image */}
      <div className="relative z-0 h-48 rounded-t-2xl overflow-hidden"
        style={{ background: user.coverImage?.startsWith("linear-gradient") || user.coverImage?.startsWith("radial-gradient")
          ? user.coverImage
          : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)" }}>
        {user.coverImage && !user.coverImage.startsWith("linear-gradient") && !user.coverImage.startsWith("radial-gradient") && (
          <Image src={user.coverImage} alt="cover" fill className="object-cover" />
        )}
        {/* Cover text overlay */}
        {user.coverText && (() => {
          let s = {};
          try { s = JSON.parse(user.coverTextStyle || "{}"); } catch {}
          return (
            <div className={`absolute inset-0 flex items-center px-8 pointer-events-none ${
              s.align === "left" ? "justify-start" : s.align === "right" ? "justify-end" : "justify-center"
            }`}>
              <p style={{
                fontSize: s.size === "sm" ? "14px" : s.size === "lg" ? "28px" : s.size === "xl" ? "40px" : "20px",
                fontWeight: s.weight === "normal" ? 400 : 700,
                fontStyle: s.italic ? "italic" : "normal",
                color: s.color || "#ffffff",
                textAlign: s.align || "center",
                textShadow: s.shadow === false ? "none" : "0 2px 8px rgba(0,0,0,0.6)",
              }} className="leading-snug break-words max-w-full">
                {user.coverText}
              </p>
            </div>
          );
        })()}
        {isOwn && (
          <Link href="/profile/edit"
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-medium backdrop-blur transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Edit cover
          </Link>
        )}
      </div>

      {/* Profile info */}
      <div className="px-5 pb-5">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-12 mb-3">
          <div className="relative z-10 ring-4 ring-white dark:ring-gray-900 rounded-full shrink-0">
            <Avatar src={user.avatar} name={user.name} size={88} />
          </div>
          <div className="flex items-center gap-2 pt-14">
            {isOwn ? (
              <Link href="/profile/edit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit profile
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <FollowButton userId={String(user._id)} />
                <button
                  onClick={handleMessage}
                  disabled={msgLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60"
                  title="Send message"
                >
                  {msgLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  )}
                  Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Name & username */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold leading-tight">{user.name}</h1>
            {user.isVerified && (
              <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
          </div>
          <p className="text-gray-500 text-sm">@{user.username}</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm leading-relaxed mb-3 text-gray-700 dark:text-gray-300">{user.bio}</p>
        )}

        {/* Location / website */}
        {(user.location || user.website) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-sm text-gray-500">
            {user.location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {user.location}
              </span>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-500 hover:underline">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                {user.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <p className="text-lg font-bold leading-tight">{user.postsCount ?? 0}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold leading-tight">{user.followersCount ?? 0}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold leading-tight">{user.followingCount ?? 0}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>
      </div>
    </div>
  );
}
