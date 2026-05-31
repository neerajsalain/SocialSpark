import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Follow from "@/models/Follow";

// GET /api/contacts — people you follow or follow you (can message)
export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongoose();

  const [following, followers] = await Promise.all([
    Follow.find({ follower: session.user.id }).populate("following", "name username avatar isVerified").lean(),
    Follow.find({ following: session.user.id }).populate("follower", "name username avatar isVerified").lean(),
  ]);

  // Deduplicate by user id
  const seen = new Set();
  const contacts = [];
  [...following.map((f) => f.following), ...followers.map((f) => f.follower)].forEach((u) => {
    if (u && !seen.has(String(u._id))) {
      seen.add(String(u._id));
      contacts.push(u);
    }
  });

  return Response.json({ success: true, data: contacts });
}
