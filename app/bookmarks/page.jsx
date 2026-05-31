import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import BookmarksFeed from "@/components/feed/BookmarksFeed";

export const metadata = { title: "Bookmarks — SocialSpark" };

export default async function BookmarksPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="max-w-6xl mx-auto flex gap-6 pt-14 px-4">
        <Sidebar session={session} />
        <main className="flex-1 min-w-0 py-6 pb-24 lg:pb-6">
          <div className="flex items-center gap-3 mb-5">
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            <h1 className="text-xl font-bold">Bookmarks</h1>
          </div>
          <BookmarksFeed />
        </main>
        <RightPanel />
      </div>
      <MobileNav session={session} />
    </div>
  );
}
