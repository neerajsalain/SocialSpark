import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Conversation from "@/models/Conversation";
import DirectMessage from "@/models/DirectMessage";
import getIO from "@/lib/socket";
import { encrypt, decrypt } from "@/lib/encrypt";

function decryptMessage(msg) {
  if (!msg) return msg;
  return { ...msg, content: msg.isDeleted ? msg.content : decrypt(msg.content) };
}

// DELETE /api/conversations/[id]/messages — clear entire chat
export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectMongoose();

  const conv = await Conversation.findOne({ _id: id, participants: session.user.id });
  if (!conv) return Response.json({ error: "Not found" }, { status: 404 });

  await DirectMessage.deleteMany({ conversation: id });
  await Conversation.updateOne(
    { _id: id },
    { $set: { lastMessage: null, lastMessageAt: new Date(), unreadCounts: {} } }
  );

  const io = getIO();
  if (io) {
    conv.participants.forEach((p) => {
      io.to(`user:${String(p)}`).emit("dm:clear", { conversationId: id });
    });
  }

  return Response.json({ success: true });
}

// GET /api/conversations/[id]/messages
export async function GET(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectMongoose();

  const conv = await Conversation.findOne({ _id: id, participants: session.user.id });
  if (!conv) return Response.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "40"), 100);
  const cursor = searchParams.get("cursor");

  const query = { conversation: id };
  if (cursor) query.createdAt = { $lt: new Date(cursor) };

  const messages = await DirectMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name username avatar")
    .lean();

  // Mark as read
  await DirectMessage.updateMany(
    { conversation: id, readBy: { $ne: session.user.id } },
    { $addToSet: { readBy: session.user.id } }
  );
  await Conversation.updateOne({ _id: id }, { $set: { [`unreadCounts.${session.user.id}`]: 0 } });

  // Decrypt content before sending to client
  const decrypted = messages.reverse().map(decryptMessage);

  return Response.json({ success: true, data: decrypted, hasMore: messages.length >= limit });
}

// POST /api/conversations/[id]/messages — send message
export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return Response.json({ error: "Content required" }, { status: 400 });

  await connectMongoose();

  const conv = await Conversation.findOne({ _id: id, participants: session.user.id });
  if (!conv) return Response.json({ error: "Not found" }, { status: 404 });

  // Encrypt before storing
  const message = await DirectMessage.create({
    conversation: id,
    sender: session.user.id,
    content: encrypt(content.trim()),
    readBy: [session.user.id],
  });

  const populated = await DirectMessage.findById(message._id)
    .populate("sender", "name username avatar")
    .lean();

  // Decrypt for socket emission (so clients receive plaintext)
  const decryptedForClient = decryptMessage(populated);

  // Update conversation metadata
  const otherParticipants = conv.participants.filter((p) => String(p) !== session.user.id);
  const unreadUpdate = {};
  otherParticipants.forEach((p) => {
    unreadUpdate[`unreadCounts.${String(p)}`] = (conv.unreadCounts?.get?.(String(p)) || 0) + 1;
  });

  await Conversation.updateOne(
    { _id: id },
    { $set: { lastMessage: message._id, lastMessageAt: new Date(), ...unreadUpdate } }
  );

  const io = getIO();
  if (io) {
    conv.participants.forEach((participantId) => {
      io.to(`user:${String(participantId)}`).emit("dm:receive", {
        conversationId: id,
        message: decryptedForClient,
      });
    });
  }

  return Response.json({ success: true, data: decryptedForClient }, { status: 201 });
}
