"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Avatar from "@/components/shared/Avatar";
import FollowButton from "@/components/profile/FollowButton";

export default function RightPanel() {
  const [suggested, setSuggested] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    axios.get("/api/explore?tab=people").then((r) => setSuggested(r.data.data?.slice(0, 4) || [])).catch(() => {});
    axios.get("/api/explore?tab=trending").then((r) => {
      const tagMap = {};
      (r.data.data || []).forEach((p) => (p.tags || []).forEach((t) => { tagMap[t] = (tagMap[t] || 0) + 1; }));
      setTags(Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count })));
    }).catch(() => {});
  }, []);

  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 py-5 sticky top-14 h-[calc(100vh-3.5rem)] gap-4 overflow-y-auto">
      {/* Trending tags */}
      {tags.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-sm mb-3.5 flex items-center gap-2 text-gray-900 dark:text-white">
            <span className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </span>
            Trending
          </h3>
          <div className="space-y-0.5">
            {tags.map((t, i) => (
              <Link key={t.name} href={`/explore?tag=${t.name}`}
                className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/80 transition group">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-300 dark:text-gray-700 font-mono w-4 shrink-0">{i + 1}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm group-hover:underline truncate">#{t.name}</span>
                </div>
                <span className="text-xs text-gray-400 ml-2 shrink-0">{t.count} post{t.count !== 1 ? "s" : ""}</span>
              </Link>
            ))}
          </div>
          <Link href="/explore" className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 px-2.5 transition">
            See all trends
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
          </Link>
        </div>
      )}

      {/* Who to follow */}
      {suggested.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-sm mb-3.5 flex items-center gap-2 text-gray-900 dark:text-white">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </span>
            Who to follow
          </h3>
          <div className="space-y-3">
            {suggested.map((u) => (
              <div key={u._id} className="flex items-center gap-2.5">
                <Link href={`/profile/${u.username}`} className="shrink-0">
                  <Avatar src={u.avatar} name={u.name} size={36} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${u.username}`} className="font-bold text-sm hover:underline truncate block leading-tight">{u.name}</Link>
                  <span className="text-xs text-gray-400">@{u.username}</span>
                </div>
                <FollowButton userId={String(u._id)} compact />
              </div>
            ))}
          </div>
          <Link href="/explore?tab=people" className="mt-3.5 flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition">
            See more
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
          </Link>
        </div>
      )}

      <p className="text-xs text-gray-300 dark:text-gray-700 px-1 mt-auto">© 2026 SocialSpark</p>
    </aside>
  );
}
