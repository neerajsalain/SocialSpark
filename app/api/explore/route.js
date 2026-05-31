import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";
import User from "@/models/User";
import Follow from "@/models/Follow";
import Like from "@/models/Like";

export async function GET(req) {
  const session = await auth();
  await connectMongoose();
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "trending";

  if (tab === "people") {
    const followingIds = session
      ? (await Follow.find({ follower: session.user.id }).select("following").lean()).map((f) => String(f.following))
      : [];
    const exclude = [...followingIds, session?.user?.id].filter(Boolean);
    const users = await User.find({ _id: { $nin: exclude } })
      .sort({ followersCount: -1 })
      .limit(20)
      .select("name username avatar bio followersCount isVerified")
      .lean();
    return Response.json({ success: true, data: users });
  }

  // Trending posts (last 48h)
  const cutoff = new Date(Date.now() - 48 * 3_600_000);
  const posts = await Post.find({ createdAt: { $gte: cutoff } })
    .sort({ trendingScore: -1, createdAt: -1 })
    .limit(20)
    .populate("author", "name username avatar isVerified")
    .lean();

  let likedSet = new Set();
  if (session) {
    const postIds = posts.map((p) => p._id);
    const likes = await Like.find({ user: session.user.id, target: { $in: postIds } }).lean();
    likedSet = new Set(likes.map((l) => String(l.target)));
  }

  const data = posts.map((p) => ({ ...p, liked: likedSet.has(String(p._id)) }));
  return Response.json({ success: true, data });
}
