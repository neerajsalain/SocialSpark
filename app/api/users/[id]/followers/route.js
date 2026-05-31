import { connectMongoose } from "@/lib/mongoose";
import Follow from "@/models/Follow";

export async function GET(req, { params }) {
  await connectMongoose();
  const { id } = await params;
  const followers = await Follow.find({ following: id })
    .populate("follower", "name username avatar")
    .lean();
  return Response.json({ success: true, data: followers.map((f) => f.follower) });
}
