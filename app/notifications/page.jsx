import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import NotificationList from "@/components/notifications/NotificationList";

export const metadata = { title: "Notifications — SocialSpark" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="max-w-6xl mx-auto flex gap-6 pt-14 px-4">
        <Sidebar session={session} />
        <main className="flex-1 min-w-0 py-6 pb-24 lg:pb-6">
          <h1 className="text-xl font-bold mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            Notifications
          </h1>
          <NotificationList />
        </main>
      </div>
      <MobileNav session={session} />
    </div>
  );
}
