import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import MobileNav from "@/components/layout/MobileNav";
import TrendingFeed from "@/components/explore/TrendingFeed";
import { auth } from "@/lib/auth";

export const metadata = { title: "Explore — SocialSpark" };

export default async function ExplorePage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="max-w-6xl mx-auto flex gap-6 pt-14 px-4">
        <Sidebar session={session} />
        <main className="flex-1 min-w-0 py-6 pb-24 lg:pb-6">
          <TrendingFeed />
        </main>
        <RightPanel />
      </div>
      <MobileNav session={session} />
    </div>
  );
}
