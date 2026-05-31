import { connectMongoose } from "@/lib/mongoose";
import User from "@/models/User";
import Post from "@/models/Post";
import Like from "@/models/Like";
import Bookmark from "@/models/Bookmark";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";

export async function generateMetadata({ params }) {
  const { username } = await params;
  return { title: `@${username} — SocialSpark` };
}

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const session = await auth();
  await connectMongoose();

  const user = await User.findOne({ username }).select("-password").lean();
  if (!user) notFound();

  const posts = await Post.find({ author: user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("author", "name username avatar isVerified")
    .lean();

  // Add liked/bookmarked status if viewer is logged in
  let likedSet = new Set();
  let bookmarkedSet = new Set();
  if (session?.user?.id && posts.length > 0) {
    const postIds = posts.map((p) => p._id);
    const [likes, bookmarks] = await Promise.all([
      Like.find({ user: session.user.id, target: { $in: postIds } }).lean(),
      Bookmark.find({ user: session.user.id, post: { $in: postIds } }).lean(),
    ]);
    likedSet = new Set(likes.map((l) => String(l.target)));
    bookmarkedSet = new Set(bookmarks.map((b) => String(b.post)));
  }

  const enrichedPosts = posts.map((p) => ({
    ...p,
    liked: likedSet.has(String(p._id)),
    bookmarked: bookmarkedSet.has(String(p._id)),
  }));

  const isOwn = session?.user?.id === String(user._id);
  const pinnedPostId = user.pinnedPost ? String(user.pinnedPost) : null;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="max-w-6xl mx-auto flex gap-6 pt-14 px-4">
        <Sidebar session={session} />
        <main className="flex-1 min-w-0 py-6 pb-24 lg:pb-6">
          <ProfileHeader
            user={{ ...JSON.parse(JSON.stringify(user)), postsCount: posts.length }}
            session={session}
          />
          <ProfileTabs
            posts={JSON.parse(JSON.stringify(enrichedPosts))}
            isOwn={isOwn}
            pinnedPostId={pinnedPostId}
          />
        </main>
      </div>
      <MobileNav session={session} />
    </div>
  );
}
