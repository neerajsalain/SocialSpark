import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import Feed from "@/components/feed/Feed";

export const metadata = { title: "Home — SocialSpark" };

export default async function FeedPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="max-w-6xl mx-auto flex gap-6 pt-14 px-4">
        <Sidebar session={session} />
        <main className="flex-1 min-w-0 py-6 pb-24 lg:pb-6">
          <Feed />
        </main>
        <RightPanel />
      </div>
      <MobileNav session={session} />
    </div>
  );
}
