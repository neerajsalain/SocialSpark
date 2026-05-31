import { connectMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";
import User from "@/models/User";

export async function GET(req) {
  await connectMongoose();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") || "posts";
  if (!q) return Response.json({ success: true, data: [] });

  const regex = new RegExp(q, "i");

  if (type === "users") {
    const users = await User.find({ $or: [{ name: regex }, { username: regex }] })
      .limit(20).select("name username avatar bio followersCount isVerified").lean();
    return Response.json({ success: true, data: users });
  }

  if (type === "all") {
    const [users, posts] = await Promise.all([
      User.find({ $or: [{ name: regex }, { username: regex }] })
        .limit(5).select("name username avatar followersCount isVerified").lean(),
      Post.find({ content: regex })
        .sort({ createdAt: -1 }).limit(5)
        .populate("author", "name username avatar isVerified").lean(),
    ]);
    return Response.json({ success: true, data: { users, posts } });
  }

  const posts = await Post.find({ content: regex })
    .sort({ createdAt: -1 }).limit(20)
    .populate("author", "name username avatar isVerified").lean();
  return Response.json({ success: true, data: posts });
}
