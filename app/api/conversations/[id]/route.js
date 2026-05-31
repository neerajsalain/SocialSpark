import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Conversation from "@/models/Conversation";

// GET /api/conversations/[id]
export async function GET(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectMongoose();

  const conv = await Conversation.findOne({ _id: id, participants: session.user.id })
    .populate("participants", "name username avatar isVerified")
    .lean();

  if (!conv) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ success: true, data: conv });
}
