import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";
import User from "@/models/User";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  const { id } = await params;
  const original = await Post.findById(id);
  if (!original) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  const repost = await Post.create({ author: session.user.id, content: original.content, media: original.media, tags: original.tags, isRepost: true, originalPost: id });
  await Post.findByIdAndUpdate(id, { $inc: { sharesCount: 1 } });
  await User.findByIdAndUpdate(session.user.id, { $inc: { postsCount: 1 } });

  return Response.json({ success: true, data: repost }, { status: 201 });
}
