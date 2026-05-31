import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Like from "@/models/Like";
import Comment from "@/models/Comment";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectMongoose();
  await Like.findOneAndUpdate(
    { user: session.user.id, target: id, targetModel: "Comment" },
    { user: session.user.id, target: id, targetModel: "Comment" },
    { upsert: true }
  );
  const count = await Like.countDocuments({ target: id, targetModel: "Comment" });
  await Comment.findByIdAndUpdate(id, { likesCount: count });
  return Response.json({ success: true, data: { likesCount: count } });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectMongoose();
  await Like.deleteOne({ user: session.user.id, target: id, targetModel: "Comment" });
  const count = await Like.countDocuments({ target: id, targetModel: "Comment" });
  await Comment.findByIdAndUpdate(id, { likesCount: count });
  return Response.json({ success: true, data: { likesCount: count } });
}
