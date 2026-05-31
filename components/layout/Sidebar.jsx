"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CreatePostModal from "@/components/feed/CreatePostModal";
import { useNotificationCount } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const links = [
  { href: "/feed",          label: "Home",          icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/explore",       label: "Explore",       icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { href: "/messages",      label: "Messages",      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", dmBadge: true },
  { href: "/notifications", label: "Notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", badge: true },
  { href: "/bookmarks",     label: "Bookmarks",     icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
];

export default function Sidebar({ session }) {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const unread = useNotificationCount();
  const unreadDMs = useUnreadMessages();
  const username = session?.user?.username || session?.user?.email?.split("@")[0];

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 shrink-0 py-5 sticky top-14 h-[calc(100vh-3.5rem)]">
        <nav className="space-y-0.5 flex-1">
          {links.map(({ href, label, icon, badge, dmBadge }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            const badgeCount = badge ? unread : dmBadge ? unreadDMs : 0;
            return (
              <Link key={href} href={href}
                className={`nav-item ${active ? "nav-item-active" : "nav-item-inactive"}`}>
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-indigo-500" />
                )}
                <div className="relative">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d={icon}/>
                  </svg>
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </div>
                <span className={active ? "font-semibold" : ""}>{label}</span>
              </Link>
            );
          })}

          {session && (
            <Link href={`/profile/${username}`}
              className={`nav-item ${pathname.startsWith("/profile") ? "nav-item-active" : "nav-item-inactive"}`}>
              {pathname.startsWith("/profile") && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-indigo-500" />
              )}
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith("/profile") ? 2.25 : 1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span className={pathname.startsWith("/profile") ? "font-semibold" : ""}>Profile</span>
            </Link>
          )}
        </nav>

        {/* New Post */}
        <div className="pt-4">
          <button onClick={() => setModalOpen(true)} className="btn-primary w-full py-3 rounded-2xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            New Post
          </button>
        </div>
      </aside>

      <CreatePostModal open={modalOpen} onClose={() => setModalOpen(false)} onPost={() => {}} />
    </>
  );
}
