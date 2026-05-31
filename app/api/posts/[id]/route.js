import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";
import User from "@/models/User";
import Like from "@/models/Like";

export async function GET(req, { params }) {
  const session = await auth();
  await connectMongoose();
  const { id } = await params;
  const post = await Post.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }, { new: true })
    .populate("author", "name username avatar isVerified").lean();
  if (!post) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  let liked = false;
  if (session) {
    const like = await Like.findOne({ user: session.user.id, target: id });
    liked = !!like;
  }
  return Response.json({ success: true, data: { ...post, liked } });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  const { id } = await params;
  const post = await Post.findById(id);
  if (!post) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  if (String(post.author) !== session.user.id) return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  await post.deleteOne();
  await User.findByIdAndUpdate(session.user.id, { $inc: { postsCount: -1 } });
  return Response.json({ success: true, data: null });
}
