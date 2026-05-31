import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import User from "@/models/User";
import Post from "@/models/Post";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectMongoose();
  const post = await Post.findById(id);
  if (!post) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  if (String(post.author) !== session.user.id)
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  await User.findByIdAndUpdate(session.user.id, { pinnedPost: id });
  return Response.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  await User.findByIdAndUpdate(session.user.id, { pinnedPost: null });
  return Response.json({ success: true });
}
