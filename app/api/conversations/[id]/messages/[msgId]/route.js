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

// PATCH — edit a message
export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, msgId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return Response.json({ error: "Content required" }, { status: 400 });

  await connectMongoose();

  const message = await DirectMessage.findOne({
    _id: msgId, conversation: id, sender: session.user.id, isDeleted: false,
  });
  if (!message) return Response.json({ error: "Message not found" }, { status: 404 });

  // Re-encrypt the updated content
  message.content = encrypt(content.trim());
  message.editedAt = new Date();
  await message.save();

  const populated = await DirectMessage.findById(msgId)
    .populate("sender", "name username avatar").lean();

  const decryptedForClient = decryptMessage(populated);

  const conv = await Conversation.findById(id).lean();
  const io = getIO();
  if (io && conv) {
    conv.participants.forEach((p) => {
      io.to(`user:${String(p)}`).emit("dm:edit", {
        conversationId: id,
        message: decryptedForClient,
      });
    });
  }

  return Response.json({ success: true, data: decryptedForClient });
}

// DELETE — soft-delete a message
export async function DELETE(_req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, msgId } = await params;
  await connectMongoose();

  const message = await DirectMessage.findOne({ _id: msgId, conversation: id, sender: session.user.id });
  if (!message) return Response.json({ error: "Message not found" }, { status: 404 });

  // Store deletion placeholder as plaintext (no encryption needed for this)
  message.isDeleted = true;
  message.content = "This message was deleted.";
  await message.save();

  const conv = await Conversation.findById(id);
  if (conv && String(conv.lastMessage) === msgId) {
    const prev = await DirectMessage.findOne({ conversation: id, isDeleted: false })
      .sort({ createdAt: -1 }).lean();
    await Conversation.updateOne(
      { _id: id },
      { $set: { lastMessage: prev?._id || null, lastMessageAt: prev?.createdAt || conv.createdAt } }
    );
  }

  const io = getIO();
  if (io && conv) {
    conv.participants.forEach((p) => {
      io.to(`user:${String(p)}`).emit("dm:delete", { conversationId: id, messageId: msgId });
    });
  }

  return Response.json({ success: true });
}
