import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import { z } from "zod";

const schema = z.object({ content: z.string().min(1).max(300) });

export async function GET(req, { params }) {
  await connectMongoose();
  const { id } = await params;
  const comments = await Comment.find({ post: id, parentComment: null })
    .sort({ createdAt: -1 })
    .populate("author", "name username avatar")
    .lean();
  return Response.json({ success: true, data: comments });
}

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const comment = await Comment.create({ post: id, author: session.user.id, content: parsed.data.content });
  const post = await Post.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } }, { new: true });

  if (post && String(post.author) !== session.user.id) {
    await Notification.create({ recipient: post.author, sender: session.user.id, type: "comment", post: id });
  }

  const populated = await comment.populate("author", "name username avatar");
  return Response.json({ success: true, data: populated }, { status: 201 });
}
