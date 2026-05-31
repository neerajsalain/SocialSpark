import { connectMongoose } from "@/lib/mongoose";
import Follow from "@/models/Follow";

export async function GET(req, { params }) {
  await connectMongoose();
  const { id } = await params;
  const following = await Follow.find({ follower: id })
    .populate("following", "name username avatar")
    .lean();
  return Response.json({ success: true, data: following.map((f) => f.following) });
}
