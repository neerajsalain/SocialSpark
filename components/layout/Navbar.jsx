"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import Avatar from "@/components/shared/Avatar";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { useNotificationCount } from "@/hooks/useNotifications";
import axios from "axios";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Navbar({ session }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const unread = useNotificationCount();
  const debouncedQuery = useDebounce(query, 300);

  const username = session?.user?.username || session?.user?.email?.split("@")[0];

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) { setResults(null); return; }
    axios.get(`/api/search?q=${encodeURIComponent(debouncedQuery)}&type=all`)
      .then((r) => setResults(r.data.data || r.data))
      .catch(() => setResults(null));
  }, [debouncedQuery]);

  useEffect(() => {
    function handle(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
      setSearchFocused(false);
      setQuery("");
    }
  }

  const showDropdown = searchFocused && query.length >= 2 && results;
  const users = results?.users || [];
  const posts = results?.posts || [];

  return (
    <nav className="fixed top-0 inset-x-0 z-40 h-14 flex items-center px-4 gap-3 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/85 dark:bg-gray-950/85 backdrop-blur-md">

      {/* Logo */}
      <Link href="/feed" className="shrink-0 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <span className="hidden sm:block text-[17px] font-bold tracking-tight" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          SocialSpark
        </span>
      </Link>

      {/* Search */}
      <div ref={searchRef} className="flex-1 max-w-xs relative">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search people, posts…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/50 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder-gray-400"
            />
          </div>
        </form>

        {showDropdown && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-900 rounded-2xl shadow-popup border border-gray-100 dark:border-gray-800 overflow-hidden z-50 max-h-80 overflow-y-auto animate-in">
            {users.length === 0 && posts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No results for &ldquo;{query}&rdquo;</p>
            )}
            {users.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3.5 pb-1.5">People</p>
                {users.slice(0, 3).map((u) => (
                  <Link key={u._id} href={`/profile/${u.username}`}
                    onClick={() => { setSearchFocused(false); setQuery(""); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition">
                    <Avatar src={u.avatar} name={u.name} size={34} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                    </div>
                    {u.followersCount > 0 && (
                      <span className="ml-auto text-xs text-gray-400 shrink-0">{u.followersCount} followers</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
            {posts.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3.5 pb-1.5">Posts</p>
                {posts.slice(0, 3).map((p) => (
                  <Link key={p._id} href={`/post/${p._id}`}
                    onClick={() => { setSearchFocused(false); setQuery(""); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.content?.slice(0, 60) || "Media post"}</p>
                      <p className="text-xs text-gray-400">@{p.author?.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {(users.length > 3 || posts.length > 3) && (
              <button onClick={() => { router.push(`/explore?q=${encodeURIComponent(query)}`); setSearchFocused(false); setQuery(""); }}
                className="w-full text-center text-sm text-indigo-500 hover:text-indigo-600 font-medium py-3 border-t border-gray-100 dark:border-gray-800 transition">
                See all results for &ldquo;{query}&rdquo;
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 ml-auto">
        <ThemeToggle />

        <Link href="/notifications"
          className={`relative p-2 rounded-xl transition-all ${pathname === "/notifications" ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80"}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          {unread > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        {session && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition">
              <Avatar src={session.user?.image} name={session.user?.name} size={30} />
              <svg className={`w-3 h-3 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-popup border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                    <p className="font-bold text-sm truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">@{username}</p>
                  </div>
                  {[
                    { href: `/profile/${username}`, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "Profile" },
                    { href: "/profile/edit", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", label: "Edit profile" },
                    { href: "/bookmarks", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z", label: "Bookmarks" },
                  ].map(({ href, icon, label }) => (
                    <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={icon}/></svg>
                      {label}
                    </Link>
                  ))}
                  <hr className="my-1.5 border-gray-100 dark:border-gray-800" />
                  <button onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
