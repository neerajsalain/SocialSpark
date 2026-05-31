import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import MessagesLayout from "@/components/messages/MessagesLayout";

export const metadata = { title: "Messages — SocialSpark" };

export default async function MessagesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="max-w-5xl mx-auto pt-14 px-4 h-screen">
        <MessagesLayout session={session} />
      </div>
      <MobileNav session={session} />
    </div>
  );
}
