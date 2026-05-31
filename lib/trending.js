import { connectMongoose } from "./mongoose.js";
import Post from "../models/Post.js";

export function calcScore(post) {
  const hoursOld = (Date.now() - new Date(post.createdAt).getTime()) / 3_600_000;
  return (
    (post.likesCount * 3 + post.commentsCount * 2 + post.sharesCount) /
    Math.pow(hoursOld + 2, 1.5)
  );
}

export async function recalculateTrending() {
  await connectMongoose();
  const cutoff = new Date(Date.now() - 48 * 3_600_000);
  const posts = await Post.find({ createdAt: { $gte: cutoff } }).lean();
  const ops = posts.map((p) => ({
    updateOne: {
      filter: { _id: p._id },
      update: { $set: { trendingScore: calcScore(p) } },
    },
  }));
  if (ops.length) await Post.bulkWrite(ops);
}
