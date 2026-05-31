import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectMongoose } from "@/lib/mongoose";
import User from "@/models/User";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import EditProfileForm from "@/components/profile/EditProfileForm";

export const metadata = { title: "Edit Profile — SocialSpark" };

export default async function EditProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  await connectMongoose();
  const user = await User.findById(session.user.id).select("-password").lean();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="max-w-6xl mx-auto flex gap-6 pt-14 px-4">
        <Sidebar session={session} />
        <main className="flex-1 min-w-0 py-6 pb-24 lg:pb-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <h1 className="text-xl font-bold">Edit Profile</h1>
          </div>
          <EditProfileForm user={JSON.parse(JSON.stringify(user))} />
        </main>
      </div>
      <MobileNav session={session} />
    </div>
  );
}
