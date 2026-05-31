import { connectMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import PostCard from "@/components/feed/PostCard";
import CommentSection from "@/components/feed/CommentSection";

export default async function PostPage({ params }) {
  const { postId } = await params;
  const session = await auth();
  await connectMongoose();
  const post = await Post.findById(postId).populate("author", "name username avatar isVerified").lean();
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="max-w-6xl mx-auto flex gap-6 pt-16 px-4">
        <Sidebar session={session} />
        <main className="flex-1 min-w-0 py-6">
          <PostCard post={JSON.parse(JSON.stringify(post))} />
          <div className="mt-4">
            <CommentSection postId={postId} />
          </div>
        </main>
      </div>
    </div>
  );
}
