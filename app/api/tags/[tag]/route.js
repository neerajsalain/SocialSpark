import { connectMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";

export async function GET(req, { params }) {
  await connectMongoose();
  const { tag } = await params;
  const posts = await Post.find({ tags: tag.toLowerCase() })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("author", "name username avatar isVerified")
    .lean();
  return Response.json({ success: true, data: posts });
}
