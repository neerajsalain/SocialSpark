import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";
import Follow from "@/models/Follow";
import User from "@/models/User";
import Tag from "@/models/Tag";
import { extractHashtags } from "@/utils/extractHashtags";
import { z } from "zod";

const schema = z.object({
  content: z.string().max(500).default(""),
  media: z.array(z.object({ url: z.string(), type: z.enum(["image", "video"]), publicId: z.string() })).default([]),
  isSensitive: z.boolean().default(false),
});

export async function GET(req) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectMongoose();
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 10;

  const following = await Follow.find({ follower: session.user.id }).select("following").lean();
  const followingIds = following.map((f) => f.following);
  followingIds.push(session.user.id);

  const query = { author: { $in: followingIds } };
  if (cursor) query.createdAt = { $lt: new Date(cursor) };

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate("author", "name username avatar isVerified")
    .populate("originalPost")
    .lean();

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  const nextCursor = hasMore ? posts[posts.length - 1].createdAt : null;

  const { default: Like } = await import("@/models/Like");
  const { default: Bookmark } = await import("@/models/Bookmark");
  const postIds = posts.map((p) => p._id);
  const [likes, bookmarks] = await Promise.all([
    Like.find({ user: session.user.id, target: { $in: postIds } }).lean(),
    Bookmark.find({ user: session.user.id, post: { $in: postIds } }).lean(),
  ]);
  const likedSet = new Set(likes.map((l) => String(l.target)));
  const bookmarkedSet = new Set(bookmarks.map((b) => String(b.post)));

  const data = posts.map((p) => ({ ...p, liked: likedSet.has(String(p._id)), bookmarked: bookmarkedSet.has(String(p._id)) }));

  return Response.json({ success: true, data, nextCursor });
}

export async function POST(req) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const { content, media, isSensitive } = parsed.data;
  if (!content && media.length === 0) return Response.json({ success: false, error: "Post cannot be empty" }, { status: 400 });

  await connectMongoose();
  const tags = extractHashtags(content);
  const post = await Post.create({ author: session.user.id, content, media, tags, isSensitive });
  await User.findByIdAndUpdate(session.user.id, { $inc: { postsCount: 1 } });

  if (tags.length) {
    await Promise.all(
      tags.map((tag) => Tag.findOneAndUpdate({ name: tag }, { $inc: { postsCount: 1 } }, { upsert: true }))
    );
  }

  const populated = await post.populate("author", "name username avatar isVerified");
  return Response.json({ success: true, data: populated }, { status: 201 });
}
