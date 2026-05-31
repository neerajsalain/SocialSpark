"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CreatePostModal from "@/components/feed/CreatePostModal";
import { useNotificationCount } from "@/hooks/useNotifications";

const navItems = [
  { href: "/feed",     label: "Home",     icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/explore",  label: "Explore",  icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  null,
  { href: "/messages", label: "Messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { href: "/notifications", label: "Alerts", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", badge: true },
];

export default function MobileNav({ session }) {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const unread = useNotificationCount();

  const username = session?.user?.username || session?.user?.email?.split("@")[0];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-t border-gray-200/60 dark:border-white/[0.06] flex items-center justify-around h-16 px-1 safe-area-pb">
        {navItems.map((item, i) =>
          item === null ? (
            <button key="post" onClick={() => setModalOpen(true)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition shadow-brand" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          ) : (
            <Link key={item.href} href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition active:scale-95 ${pathname === item.href || (item.href === "/bookmarks" && pathname === "/bookmarks") ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}>
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.badge && unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 font-bold">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        )}
      </nav>
      <CreatePostModal open={modalOpen} onClose={() => setModalOpen(false)} onPost={() => {}} />
    </>
  );
}
