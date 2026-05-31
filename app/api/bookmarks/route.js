import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Bookmark from "@/models/Bookmark";
import Like from "@/models/Like";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();

  const bookmarks = await Bookmark.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .populate({ path: "post", populate: { path: "author", select: "name username avatar isVerified" } })
    .lean();

  const posts = bookmarks.map((b) => b.post).filter(Boolean);
  const postIds = posts.map((p) => p._id);
  const likes = await Like.find({ user: session.user.id, target: { $in: postIds } }).lean();
  const likedSet = new Set(likes.map((l) => String(l.target)));

  const data = posts.map((p) => ({ ...p, liked: likedSet.has(String(p._id)), bookmarked: true }));
  return Response.json({ success: true, data });
}
