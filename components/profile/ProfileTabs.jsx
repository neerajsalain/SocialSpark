"use client";
import { useState } from "react";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";
import Image from "next/image";
import Link from "next/link";

export default function ProfileTabs({ posts, isOwn, pinnedPostId }) {
  const [tab, setTab] = useState("posts");
  const [modalOpen, setModalOpen] = useState(false);

  const mediaPosts = posts.filter((p) => p.media?.length > 0);

  const tabs = [
    { id: "posts", label: "Posts", count: posts.length },
    { id: "media", label: "Media", count: mediaPosts.length },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden mb-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              tab === t.id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              tab === t.id ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {tab === "posts" && (
        <div className="mt-4 space-y-3">
          {/* Pinned post */}
          {pinnedPostId && (() => {
            const pinned = posts.find((p) => String(p._id) === pinnedPostId);
            return pinned ? <PostCard key="pinned" post={pinned} showPin={isOwn} isPinned={true} /> : null;
          })()}
          {posts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">No posts yet</p>
              <p className="text-sm text-gray-400 mt-1">
                {isOwn ? "Share something with your followers" : "No posts to show"}
              </p>
              {isOwn && (
                <button onClick={() => setModalOpen(true)}
                  className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition">
                  Create your first post
                </button>
              )}
            </div>
          ) : (
            posts.filter((p) => String(p._id) !== pinnedPostId).map((post) => (
              <PostCard key={post._id} post={post} showPin={isOwn} isPinned={false} />
            ))
          )}
        </div>
      )}
      <CreatePostModal open={modalOpen} onClose={() => setModalOpen(false)} onPost={() => {}} />

      {/* Media tab */}
      {tab === "media" && (
        <div className="mt-4">
          {mediaPosts.length === 0 ? (
            <EmptyState icon="media" message="No media yet" sub="Photos and videos will appear here" />
          ) : (
            <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
              {mediaPosts.map((post) => {
                const m = post.media[0];
                return (
                  <Link key={post._id} href={`/post/${post._id}`}
                    className="relative aspect-square bg-gray-100 dark:bg-gray-800 group overflow-hidden">
                    {m.type === "video" ? (
                      <>
                        <video src={m.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <Image src={m.url} alt="" fill className="object-cover transition group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-3 text-white text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                          {post.commentsCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, message, sub }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
        {icon === "media" ? (
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        ) : (
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
        )}
      </div>
      <p className="font-semibold text-gray-700 dark:text-gray-300">{message}</p>
      <p className="text-sm text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
