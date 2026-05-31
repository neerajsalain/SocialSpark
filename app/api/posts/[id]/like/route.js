import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Like from "@/models/Like";
import Post from "@/models/Post";
import Notification from "@/models/Notification";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  const { id } = await params;

  const existing = await Like.findOne({ user: session.user.id, target: id, targetModel: "Post" });
  if (existing) return Response.json({ success: false, error: "Already liked" }, { status: 409 });

  await Like.create({ user: session.user.id, target: id, targetModel: "Post" });
  const post = await Post.findByIdAndUpdate(id, { $inc: { likesCount: 1 } }, { new: true });

  if (post && String(post.author) !== session.user.id) {
    await Notification.create({ recipient: post.author, sender: session.user.id, type: "like", post: id });
  }

  return Response.json({ success: true, data: { likesCount: post.likesCount, liked: true } });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  const { id } = await params;

  await Like.deleteOne({ user: session.user.id, target: id, targetModel: "Post" });
  const post = await Post.findByIdAndUpdate(id, { $inc: { likesCount: -1 } }, { new: true });

  return Response.json({ success: true, data: { likesCount: Math.max(0, post?.likesCount ?? 0), liked: false } });
}
