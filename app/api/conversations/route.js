import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Conversation from "@/models/Conversation";
import DirectMessage from "@/models/DirectMessage";
import User from "@/models/User";
import Follow from "@/models/Follow";

// GET /api/conversations — list my conversations
export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongoose();

  const conversations = await Conversation.find({ participants: session.user.id })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name username avatar isVerified")
    .populate("lastMessage", "content createdAt sender")
    .lean();

  const data = conversations.map((c) => ({
    ...c,
    unread: c.unreadCounts?.get?.(session.user.id) ?? (c.unreadCounts?.[session.user.id] || 0),
    other: c.participants.find((p) => String(p._id) !== session.user.id),
  }));

  return Response.json({ success: true, data });
}

// POST /api/conversations — start or get existing DM
export async function POST(req) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { recipientId } = await req.json();
  if (!recipientId) return Response.json({ error: "recipientId required" }, { status: 400 });
  if (recipientId === session.user.id) return Response.json({ error: "Cannot message yourself" }, { status: 400 });

  await connectMongoose();

  // Check recipient exists
  const recipient = await User.findById(recipientId).select("name username avatar").lean();
  if (!recipient) return Response.json({ error: "User not found" }, { status: 404 });

  // Check follow relationship (either direction)
  const followExists = await Follow.exists({
    $or: [
      { follower: session.user.id, following: recipientId },
      { follower: recipientId, following: session.user.id },
    ],
  });
  if (!followExists) return Response.json({ error: "You can only message followers" }, { status: 403 });

  // Find or create conversation
  let conv = await Conversation.findOne({
    participants: { $all: [session.user.id, recipientId], $size: 2 },
  }).populate("participants", "name username avatar isVerified");

  if (!conv) {
    conv = await Conversation.create({ participants: [session.user.id, recipientId] });
    conv = await Conversation.findById(conv._id).populate("participants", "name username avatar isVerified");
  }

  return Response.json({ success: true, data: conv });
}
