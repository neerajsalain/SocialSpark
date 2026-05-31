"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "@/components/feed/PostCard";
import Avatar from "@/components/shared/Avatar";
import Link from "next/link";
import FollowButton from "@/components/profile/FollowButton";

export default function TrendingFeed() {
  const [tab, setTab] = useState("trending");
  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/explore?tab=${tab}`)
      .then((r) => {
        if (tab === "trending") setPosts(r.data.data || []);
        else setPeople(r.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1.5 mb-6 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl w-fit">
        {[
          { id: "trending", label: "Trending", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
          { id: "people",   label: "People",   icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              tab === t.id
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-soft"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-1/4" />
                </div>
              </div>
              <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Trending posts */}
      {!loading && tab === "trending" && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <EmptyState
              icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              title="Nothing trending yet"
              sub="Check back later for trending posts"
            />
          ) : (
            posts.map((p) => <PostCard key={p._id} post={p} />)
          )}
        </div>
      )}

      {/* People */}
      {!loading && tab === "people" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {people.length === 0 ? (
            <div className="col-span-2">
              <EmptyState
                icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                title="No people to suggest"
                sub="You're already following everyone, or no users have joined yet"
              />
            </div>
          ) : (
            people.map((u) => (
              <div key={u._id} className="card-hover p-4 flex items-center gap-3.5">
                <Link href={`/profile/${u.username}`} className="shrink-0">
                  <Avatar src={u.avatar} name={u.name} size={48} />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link href={`/profile/${u.username}`} className="font-bold text-sm hover:underline truncate">{u.name}</Link>
                    {u.isVerified && (
                      <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">@{u.username}</p>
                  {u.bio && <p className="text-xs text-gray-500 mt-1 truncate">{u.bio}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{u.followersCount ?? 0} followers</p>
                </div>
                <FollowButton userId={String(u._id)} compact />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="card py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <p className="font-bold text-gray-700 dark:text-gray-300">{title}</p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">{sub}</p>
    </div>
  );
}
